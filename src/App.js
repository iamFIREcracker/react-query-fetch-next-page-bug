import "./App.css";
import { useInfiniteQuery } from "react-query";
import { useEffect, useState } from "react";

const fakeData =
  (returnEmpty) =>
  ({ pageParam, signal }) => {
    let aborted = false;
    signal.addEventListener("abort", () => {
      aborted = true;
    });
    const page = pageParam?.page || 0;
    return new Promise((resolve) => {
      setTimeout(
        () => {
          const data = [];
          for (let i = 0; i < 10; i++) {
            data.push(page * 10 + i);
          }
          if (aborted) return;
          if (returnEmpty) {
            return resolve({
              data: [],
            });
          }
          resolve({
            data,
            next: page + 1,
          });
        },
        returnEmpty ? 200 : 2000
      );
    });
  };

function Search({ firstFetchEmpty }) {
  const { data, isLoading, isFetching, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery(["search"], fakeData(firstFetchEmpty), {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.next;
        return nextPage < 10 ? { page: nextPage } : undefined;
      },
    });

  return (
    <>
      <h3>Search</h3>
      <p>
        {!isLoading && !isFetchingNextPage && isFetching && (
          <span>(Refetching)</span>
        )}
      </p>
      {data?.pages.map((page, idx) => (
        <div key={`body-${idx}`}>
          <p>Page {idx}</p>
          <pre>{JSON.stringify(page)}</pre>
        </div>
      ))}
      {(isLoading || isFetchingNextPage) && <p>Loading...</p>}
      <button onClick={fetchNextPage}>Load more</button>
    </>
  );
}

function Profile() {
  return (
    <>
      <h3>Profile</h3>
      <p>Lovely!</p>
      <p>
        Now switch back to the "Search" screen, and before the background
        refetch is over, try to "Load more" results
      </p>
    </>
  );
}

function App() {
  const [mounting, setMounting] = useState(true);
  const [screen, setTab] = useState(0);

  useEffect(() => {
    setMounting(false);
  }, []);

  return (
    <div className="App">
      <h1>
        Unexpected behavior when calling <code>fetchNextPage</code> during a
        background data refetch
      </h1>
      <section>
        <h2>Scenario</h2>
        <details open>
          <ul>
            <li>Multiple screens</li>
            <li>
              "Search" screen, using <code>useInfiniteQuery</code> to fetch data
              from the backend
            </li>
            <li>"Profile" screen, allowing the user to...do something</li>
            <li>
              The user first lands on the "Search" screen, and the first backend
              response is an empty array
            </li>
            <li>
              The user then navigates to the "Profile" screen; they do something
              with the expectation that the "Search" screen will now show
              something instead of the empty array
            </li>
            <li>
              The user switches back to the "Search" screen but nothing really
              changes, i.e. the cached data is used
            </li>
          </ul>
        </details>
      </section>
      <section>
        <h2>Playground</h2>
        <section>
          <h3>Steps to reproduce</h3>
          <details open>
            <ol>
              <li>
                Refresh the page (or click the "Refresh" button) - when the App
                mounts, the fake data fetcher is supposed to return an empty
                array after around 200ms
              </li>
              <li>
                Click the "Profile" button - we are not going to let you
                interact with anything, really; but let's assume you did, and
                you expected new data to now show up on the "Search" screen
              </li>
              <li>
                Click the "Search" button, and before background data-fetching
                is over (you have around 2s of time), click on "Load more"
              </li>
            </ol>
          </details>
        </section>
        <section>
          <h3>Expected behavior</h3>
          <details open>
            <p>
              Refreshed data (i.e. the first page worth of data) will be shown
              after the background data-fetching is over (around 2s)
            </p>
          </details>
        </section>
        <section>
          <h3>Actual behavior</h3>
          <details open>
            <p>
              The cached data (i.e. the empty array) is returned, immediately,
              and the background refetch aborted
            </p>
          </details>
        </section>
        <section>
          <h3>Your turn now...</h3>
          <div style={{ backgroundColor: "#eaeaea", padding: "1rem" }}>
            <p>
              <button onClick={() => window.location.reload()}>Refresh</button>
              <button onClick={() => setTab(0)}>Search</button>
              <button onClick={() => setTab(1)}>Profile</button>
            </p>
            {screen === 0 && <Search firstFetchEmpty={mounting} />}
            {screen === 1 && <Profile />}
          </div>
        </section>
      </section>
      <section>
        <h3>Why would you click on "Load more" while it's refetching?</h3>
        <p>
          It's not that I <em>wanted to</em>; it <em>happened</em>.
        </p>
        <p>
          In a real application, you will probably have a <em>sentinel</em> kind
          of element that you will use to fetch the next page: does it intersect
          with the current view? Then it means the user has scrolled to the
          bottom of the current list of results and it's time to{" "}
          <code>fetchNextPage</code>.
        </p>

        <p>
          Too bad that due to a bug in the render function, we accidentally
          mounted that element in the DOM even if <code>hasNextPage</code> was{" "}
          <code>false</code> (or even <code>useInfiniteQuery</code> was
          refetching); the element immediately intersected with the current
          view, and as a result, we ended up calling <code>fetchNextPage</code>{" "}
          -- and as you can see from the playground above,{" "}
          <code>react-query</code> does not seem to be happy about it...
        </p>

        <p>
          Is this a user error? You bet. We fixed the rendering issue, and went
          on with our lives!
        </p>

        <p>
          Could have <code>react-query</code> better handled the situation? I am
          going to leave the answer to that to the maintainers of the awesome
          library!
        </p>
      </section>
    </div>
  );
}

export default App;
