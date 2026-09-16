import re

with open('src/services/storageService.ts', 'r') as f:
    content = f.read()

content = content.replace("localStudents = JSON.parse(local);", "localStudents = JSON.parse(local) || [];")
content = content.replace("localTrxs = JSON.parse(local);", "localTrxs = JSON.parse(local) || [];")
content = content.replace("localTopups = JSON.parse(local);", "localTopups = JSON.parse(local) || [];")
content = content.replace("localList = JSON.parse(local);", "localList = JSON.parse(local) || [];")

with open('src/services/storageService.ts', 'w') as f:
    f.write(content)
