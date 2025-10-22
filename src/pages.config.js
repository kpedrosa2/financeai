import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Transactions": Transactions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};