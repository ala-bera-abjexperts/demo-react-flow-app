import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <WorkflowCanvas />
    </TooltipProvider>
  );
}

export default App;
