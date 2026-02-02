# Ryan Lindell - Portfolio

Developer portfolio built with **Next.js** and **React**.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deploy

```bash
npm run build
npm start
```

### Deploy on Vercel

Vercel auto-detects Next.js. Import this repo at [vercel.com](https://vercel.com) and deploy.

**Custom domain (ryanlindell.com):** Add the domain in Project Settings → Domains, then update DNS to point to `cname.vercel-dns.com`.

### GitHub API (live "last updated" times)

Project cards fetch "last updated" from the GitHub API. Without a token you get 60 requests/hour; add `GITHUB_TOKEN` in Vercel (or `.env.local` for dev) for 5,000/hour and access to private repos.
