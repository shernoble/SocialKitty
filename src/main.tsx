
import ReactDOM  from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

                                // should not be null
ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>
)