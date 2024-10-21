import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const fileNames = [
  "cashflow",
  "secDetail",
  "redemption",
  "subsecinfo",
  "transaction",
  "stockmasterV3",
  "stockmasterV2",
  "ratingmaster",
  "marketprice",
  "subposition",
  "position",
  "ledger",
  "trialbalance",
];

const App = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);

  const [marketprice, setmarketprice] = useState(null);

  const [lastSystemDate, setlastSystemDate] = useState(null);

  const [systemDate, setSystemDate] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [file, setFile] = useState("");

  const downloadXLSX = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, filename);
  };

  const handleFile1Change = (e) => {
    setFile1(e.target.files[0]);
  };

  const handleFile2Change = (e) => {
    setFile2(e.target.files[0]);
  };

  const handleFile3Change = (e) => {
    setFile3(e.target.files[0]);
  };

  const handlemarketpriceChange = (e) => {
    setmarketprice(e.target.files[0]);
  };

  useEffect(() => {
    axios
      .get("/api/systemdate")
      .then(({ data }) => {
        console.log(data);
        if (data.status) {
          const result = data.data;
          console.log(result.SystemDate);
          setlastSystemDate(result.SystemDate.split("T")[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDownload = async () => {
    if (!file) {
      return alert("Please select a file");
    } else if (!from) {
      return alert("Please select from date");
    } else if (!to) {
      return alert("Please select to date");
    }

    try {
      const { data } = await axios.post("/api/download", {
        from,
        to,
        file,
      });

      if (data.status) {
        downloadXLSX(data.data, `${file}.xlsx`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      // console.log(err);
      alert(error.response.data.message);
    }
  };

  const handleResultAndStockmaster = async () => {
    if (!systemDate) {
      return alert("Please select settlement date");
    }

    try {
      console.log(systemDate);
      const { data } = await axios.post("/api/subsecinfo", {
        system_date: systemDate,
      });

      if (data.status) {
        console.log("Result file calculated successfully");
      }
    } catch (err) {
      console.log(err);
      alert("Something bad happened");
    }
  };

  const handleSubPosition = async () => {
    if (!systemDate) {
      return alert("Please select settlement date");
    }

    try {
      const { data } = await axios.post("/api/subposition", {
        system_date: systemDate,
      });

      if (data.status) {
        // downloadXLSX(data.subposition, "SubPosition.xlsx");

        console.log("Sub-Position calculated successfully");
      }
    } catch (err) {
      console.log(err);
      alert("Something bad happened");
    }
  };

  const handlePosition = async () => {
    try {
      if (!systemDate) {
        return alert("Please select settlement date");
      }

      const { data } = await axios.post("/api/position", {
        system_date: systemDate,
      });

      if (data.status) {
        // downloadXLSX(data.position, "Position.xlsx");

        console.log("Position calculated successfully");
      }
    } catch (err) {
      console.log(err);
      alert("Something bad happened");
    }
  };

  const handleLedger = async () => {
    try {
      const { data } = await axios.post("/api/ledger");

      if (data.status) {
        console.log("Ledger calculated successfully");
      }
    } catch (err) {
      return err;
    }
  };

  const handleTrialBalance = async () => {
    try {
      const { data } = await axios.post("/api/trialbalance");

      if (data.status) {
        console.log(data.message);
      }
    } catch (err) {
      return err;
    }
  };

  const handleMarketPrice = async () => {
    if (!marketprice) {
      return alert("Please Upload MarketPrice file");
    }

    const formData = new FormData();
    formData.append("file", marketprice);

    try {
      const { data } = await axios.post("/api/marketprice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.status) {
        //   downloadXLSX(data.marketprices, "MarketPrices.xlsx");
        alert("MarketPrice file uploaded successfully");
      }
    } catch (err) {
      console.log(err);
      alert("Failed to upload file.");
    }
  };

  const handleCashflowUpload = async () => {
    if (!file1) {
      return alert("Please Upload Cashflow file");
    }

    const formData = new FormData();
    formData.append("file", file1);

    try {
      const { data } = await axios.post("/api/cashflowupload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.status) {
        alert("Cashflow file uploaded successfully");
      }
    } catch (err) {
      alert("Failed to upload file.");
    }
  };

  const handleSecurityUpload = async () => {
    if (!file2) {
      return alert("Please Upload File 2");
    }

    const formData = new FormData();
    formData.append("file", file2);

    try {
      const response = await axios.post("/api/securityupload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.status) {
        alert("Files uploaded successfully");
      }
    } catch (err) {
      alert("Failed to upload file.");
    }
  };

  const handleStockmasterUpload = async () => {
    if (!file3) {
      return alert("Please Upload Stockmaster File");
    }

    const formData = new FormData();
    formData.append("file", file3);

    try {
      const response = await axios.post("/api/stockmasterupload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.status) {
        alert("Files uploaded successfully");
      }
    } catch (err) {
      alert("Failed to upload file.");
    }
  };

  const handleSubmit = async () => {
    try {
      await handleResultAndStockmaster();
      await handleSubPosition();
      await handlePosition();
      await handleLedger();
      await handleTrialBalance();
      setlastSystemDate(systemDate);
      alert("Data Calculated");
    } catch (error) {
      return alert(error.message);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full bg-slate-900 h-screen p-4 gap-4 bg-slate-100">
      <h2 className="text-2xl text-white font-bold">Upload Excel File</h2>
      <div className="flex gap-4 w-full">
        <div className="w-1/2 flex flex-col gap-4 p-4 rounded-lg justify-around items-center">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-4 items-center">
              <input
                type="file"
                className="hidden"
                id="file1"
                onChange={handleFile1Change}
                accept=".xlsx, .xls"
              />
              <div>{file1?.name ? file1.name : "No File Selected"}</div>

              <label
                htmlFor="file1"
                className="bg-slate-100 text-black p-2 font-bold rounded-md"
              >
                Upload Cashflow File
              </label>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="bg-lime-300 p-2 px-4 text-black font-bold rounded-lg"
              onClick={handleCashflowUpload}
            >
              Upload
            </button>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-4 p-4 rounded-lg justify-around items-center">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-4 items-center">
              <input
                type="file"
                className="hidden"
                id="file2"
                onChange={handleFile2Change}
                accept=".xlsx, .xls"
              />

              <div>{file2?.name ? file2.name : "No File Selected"}</div>

              <label
                className="bg-slate-100 text-black p-2 font-bold rounded-md"
                htmlFor="file2"
              >
                Upload Security Details File
              </label>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="bg-lime-300 p-2 px-4 text-black font-bold rounded-lg"
              onClick={handleSecurityUpload}
            >
              Upload
            </button>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-4 p-4 rounded-lg justify-around items-center">
          <div className="justify-between ">
            <div className="flex flex-col gap-4 items-center">
              <input
                type="file"
                className="hidden"
                id="file3"
                onChange={handleFile3Change}
                accept=".xlsx, .xls"
              />
              <div>{file3?.name ? file3.name : "No File Selected"}</div>
              <label
                htmlFor="file3"
                className="bg-slate-100 text-black p-2 font-bold rounded-md"
              >
                Upload StockMasterV1 File
              </label>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="bg-lime-300 p-2 px-4 text-black font-bold rounded-lg"
              onClick={handleStockmasterUpload}
            >
              Upload
            </button>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-4 p-4 rounded-lg justify-around items-center">
          <div className="justify-between ">
            <div className="flex flex-col gap-4 items-center">
              <input
                type="file"
                className="hidden"
                id="marketprice"
                onChange={handlemarketpriceChange}
                accept=".xlsx, .xls"
              />
              <div>
                {marketprice?.name ? marketprice.name : "No File Selected"}
              </div>
              <label
                htmlFor="marketprice"
                className="bg-slate-100 text-black p-2 font-bold rounded-md"
              >
                Upload MarketPrice File
              </label>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="bg-lime-300 p-2 px-4 text-black font-bold rounded-lg"
              onClick={handleMarketPrice}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 w-full">
        <div className=" flex flex-col justify-around items-center gap-4 p-6 rounded-lg">
          <div className="text-xl ">Submit System Date for Calculation</div>
          {lastSystemDate && (
            <div className="text-xl ">Last System Date : {lastSystemDate}</div>
          )}
          <div className="flex items-center justify-around gap-4 w-full">
            <div className="flex flex-col gap-2 items-center">
              <input
                type="date"
                name=""
                id="systemdate"
                className="p-2 px-4 border-white border-2 rounded-md text-black bg-white font-bold"
                onChange={(e) => setSystemDate(e.target.value)}
              />
            </div>

            <button
              className="h-fit bg-orange-400 p-2 px-6 text-black font-bold rounded-md"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 w-full">
        <div className=" flex flex-col justify-around items-center gap-4 p-6 rounded-lg">
          <div className="text-xl ">Download File Data</div>
          <div className="flex items-center justify-around gap-4 w-full p-2">
            <div className="flex gap-2">
              <div className="p-2 flex flex-col gap-2">
                <div>From</div>
                <input
                  type="date"
                  name=""
                  id=""
                  className="p-2 px-4 border-white border-2 rounded-md text-black bg-white font-bold"
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="p-2 flex flex-col gap-2">
                <div>To</div>
                <input
                  type="date"
                  name=""
                  id=""
                  className="p-2 px-4 border-white border-2 rounded-md text-black bg-white font-bold"
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 ">
              <div>File</div>
              <select
                name=""
                id=""
                className="p-2 px-4 border-white border-2 rounded-md text-black bg-white font-bold"
                onChange={(e) => setFile(e.target.value)}
              >
                <option value="">Select File</option>
                {fileNames.map((fileName, index) => (
                  <option key={index} value={fileName}>
                    {fileName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-8 px-2 ">
              <div></div>
              <button
                className="h-fit bg-orange-400 p-2 px-6 text-black font-bold rounded-md"
                onClick={handleDownload}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
