import { UploadForm } from "./components/UploadForm";

function App() {
  return (
    <main className="bg-linear-to-br from-violet-500 to-fuchsia-500 bg-radial min-h-screen py-10">
      <UploadForm
        onUploadSuccess={function (analysisId: string): void {
          throw new Error("Function not implemented.");
        }}
      />
    </main>
  );
}

export default App;
