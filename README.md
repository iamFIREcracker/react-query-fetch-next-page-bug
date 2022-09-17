# react-query-fetch-next-page-bug

Are you allowed to call `useInfiniteQuery`'s `fetchNextPage` when `hasNextPage` is `false`? And most importantly: should you? Let's find out!

Spoiler alert: you should not!

## Instructions

You can either point your browser to this [Repl](https://react-query-fetch-next-page-bug.iamfirecracker.repl.co/) and follow the instructions on screen; or you can do it the old school way:

- Clone this repository
- Install its dependencies

```
npm install
```

- Run the app

```
npm run start
```

If all went well a new browser window should have opened pointing to the Web application of this repository (if not, point your browser to "http://localhost:3000" or whichever URL `create-react-app` would have logged in the terminal).
