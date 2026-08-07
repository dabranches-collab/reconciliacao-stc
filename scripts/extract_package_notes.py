from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/package/2006/relationships",
}

for argument in sys.argv[1:]:
    path = Path(argument)
    result = {"file": str(path), "comments": [], "external_relationships": []}
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if name.startswith("xl/comments") and name.endswith(".xml"):
                root = ET.fromstring(archive.read(name))
                authors = [node.text or "" for node in root.findall("m:authors/m:author", NS)]
                for comment in root.findall("m:commentList/m:comment", NS):
                    text = "".join(node.text or "" for node in comment.findall(".//m:t", NS))
                    author_id = int(comment.attrib.get("authorId", "0"))
                    result["comments"].append({
                        "part": name,
                        "ref": comment.attrib.get("ref"),
                        "author": authors[author_id] if author_id < len(authors) else "",
                        "text": text,
                    })
            if name.startswith("xl/externalLinks/_rels/") and name.endswith(".rels"):
                root = ET.fromstring(archive.read(name))
                for relationship in root.findall("r:Relationship", NS):
                    result["external_relationships"].append({
                        "part": name,
                        "target": relationship.attrib.get("Target"),
                        "type": relationship.attrib.get("Type"),
                    })
    print(json.dumps(result, ensure_ascii=False, indent=2))
