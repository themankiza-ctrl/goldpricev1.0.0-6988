import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Kalkulator from "./pages/kalkulator";
import Admin from "./pages/admin";
import { Layout } from "./components/layout";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/kalkulator" component={Kalkulator} />
          <Route path="/admin" component={Admin} />
          <Route>
            <div className="mx-auto max-w-[1200px] px-6 py-32">
              <h1 className="display text-5xl font-extrabold">404</h1>
              <p className="mt-3 text-muted">Ova stranica ne postoji.</p>
            </div>
          </Route>
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
