import React, { useState } from "react";

export default function App() {
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleUpload(event) {
    if (!file) {
      alert("please select a file first");
      return;
    }

    const formData = new FormData();

    formData.append("erd", file);

    console.log(formData);
  }

  return (
    <>
      <input
        type="file"
        id="erd-upload"
        name="uploaded-erd"
        onChange={handleFileChange}
      ></input>
      <br />
      <br />
      <button onClick={handleUpload}>Upload</button>
      <br /> <br />
      {file && <label> ERD to be uploaded : {file.name}</label>}
    </>
  );
}
