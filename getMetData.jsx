//pass in list of items we retrieved, pagesize, and the handler
const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  //if number of items is less than or equal to 1 we don't need to have any pagination, we don't need page buttons
  if (items.length <= 1) return null;

  //calculate the total # of pages we need, divide the total number of items by page size (in this case page size is hard coded) and round up
  let num = Math.ceil(items.length / pageSize);
  //now we get an array that has the number of pages in it
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    //here we return the blue page buttons
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  //put the buttons into an unordered list and we return that between two nav divs
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets a list of departments from the MET API
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://collectionapi.metmuseum.org/public/collection/v1/departments",
    {
      departments: []
    }
  );
  const handlePageChange = e => {
    //identify which page button was selected and convert it to a number
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.departments;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  console.log(data.departments);
  let deptURL = 'https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId='+data.departments.departmentId+`&q=ca`;
  

  
  return (
    <Fragment>
      <form
        onSubmit={event => {
          doFetch("https://collectionapi.metmuseum.org/public/collection/v1/search?q=" + query);
          {console.log("https://collectionapi.metmuseum.org/public/collection/v1/search?q="+query)}
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        
        <ul>
          {page.map(item => (
            <li key={item.departmentId}>
              <a href={"https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=" + item.departmentId + "&q=cat"}>{item.displayName}</a>
            </li>
          ))}
        </ul>
        
      )}
      
      
      <Pagination
      //we have to pass the following in in this order because we've used destructuring in our Pagination component
        items={data.departments}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
