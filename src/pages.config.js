import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import AIAnalysis from './pages/AIAnalysis';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Transactions": Transactions,
    "Debts": Debts,
    "Goals": Goals,
    "AIAnalysis": AIAnalysis,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};