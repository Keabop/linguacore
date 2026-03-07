---
description: Deploy LinguaCore to Vercel production
---

# Deploy to Vercel

// turbo-all

1. Build the project locally first to check for errors:
```
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; & "C:\Program Files\nodejs\npm.cmd" run build
```

2. Deploy to Vercel production:
```
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; & "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" -y vercel --prod --yes
```

3. The deployment URL will be shown in the output. The production URL is:
   **https://linguacore-zeta.vercel.app**
