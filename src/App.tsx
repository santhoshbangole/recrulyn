import { useEffect } from "react";
import { supabase } from "./services/supabase/client";

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.auth.getSession();

      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    testConnection();
  }, []);

  return (
    <div>
      <h1>Recrulyn</h1>
      <p>Supabase Connection Test</p>
    </div>
  );
}

export default App;