import { useState } from "react";
import PDFViewer from "./pdfViewer";
import Test from "./test";

const Portal = () => {
  const [started, setStarted] = useState(false);

  return (
    <main className="z-6 relative h-full bg-white font-general duration-150 dark:bg-gray-900">
      <div className="z-5 pattern-opacity-90 pattern-cross absolute h-[100vh] w-[100vw] duration-150 pattern-bg-gray-500 pattern-gray-800 pattern-size-6 dark:pattern-bg-gray-500 dark:pattern-gray-800"></div>
      <div className="grid h-full w-full md:grid-cols-12">
        {started && <PDFViewer />}
        <Test started={started} setStarted={setStarted} />
      </div>
    </main>
  );
};

export default Portal;
