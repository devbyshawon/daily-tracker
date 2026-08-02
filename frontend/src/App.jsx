import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';


const App = () => {
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return <Dashboard />;
};

export default App;