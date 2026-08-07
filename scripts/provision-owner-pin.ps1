$ErrorActionPreference = 'Stop'
$outputDirectory = Join-Path $PSScriptRoot '..\.local-data'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

function Read-PlainPin([string]$Prompt) {
  $secure = Read-Host $Prompt -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

$pin = Read-PlainPin 'Defina o PIN de dabranches (6 a 12 algarismos)'
$confirmation = Read-PlainPin 'Confirme o PIN'
if ($pin -notmatch '^\d{6,12}$') { throw 'O PIN deve conter entre 6 e 12 algarismos.' }
if ($pin -cne $confirmation) { throw 'Os PIN não coincidem.' }

$salt = New-Object byte[] 16
$pepper = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $random.GetBytes($salt); $random.GetBytes($pepper) } finally { $random.Dispose() }
$saltHex = ([BitConverter]::ToString($salt) -replace '-', '').ToLowerInvariant()
$pepperHex = ([BitConverter]::ToString($pepper) -replace '-', '').ToLowerInvariant()
$material = [Text.Encoding]::UTF8.GetBytes("${pin}:${pepperHex}")
$derive = [Security.Cryptography.Rfc2898DeriveBytes]::new($material, $salt, 310000, [Security.Cryptography.HashAlgorithmName]::SHA256)
try { $hashHex = ([BitConverter]::ToString($derive.GetBytes(32)) -replace '-', '').ToLowerInvariant() }
finally { $derive.Dispose(); [Array]::Clear($material, 0, $material.Length); $pin = $null; $confirmation = $null }

@{ salt = $saltHex; hash = $hashHex; iterations = 310000 } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputDirectory 'owner-pin-verifier.json') -Encoding UTF8
Set-Content -LiteralPath (Join-Path $outputDirectory 'auth-pepper.txt') -Value $pepperHex -Encoding ASCII -NoNewline
Write-Host 'PIN preparado com segurança. Pode fechar esta janela.' -ForegroundColor Green
