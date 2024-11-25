This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) which shows a simple example of creating a comments page with RxDB.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


The page allows to add comments and replies to comments. It is also possible to delete one comment (with its replies) as well as all of them together. The comments are stored in a local database using RxDB so they are persisted even across page reloads and tabs.