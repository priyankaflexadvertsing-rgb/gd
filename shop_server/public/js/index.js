document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");
  const imagePreview = document.getElementById("imagePreview");
  const uploadText = document.getElementById("uploadText");
  const uploadPrinting = document.getElementById("uploadPrinting");
  const tablePreview = document.getElementById("tablePreview");
  // const signUp = document.getElementById("loginForm");

  let thumbnails = [];
  let thumbnailsName = [];

  fileInput.addEventListener("change", (event) =>
    handleFiles(event.target.files)
  );
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("dragging");
  });
  dropArea.addEventListener("dragleave", () =>
    dropArea.classList.remove("dragging")
  );
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("dragging");
    handleFiles(event.dataTransfer.files);
  });

  uploadPrinting.addEventListener("click", (event) =>
    handleUploadPrinting(thumbnailsName)
  );

  // signUp.addEventListener("submit", async function (event) {
  //   event.preventDefault(); // Prevent default form submission

  //   const formData = new FormData(event.target);
  //   const userData = {
  //     username: formData.get("username"),
  //     email: formData.get("email"),
  //     password: formData.get("password"),
  //   };

  //   try {
  //     const response = await fetch("http://localhost:8000/api/V2/sign-up", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(userData),
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       alert("Login successful!");
  //       // Redirect or perform further actions
  //     } else {
  //       alert("Error: " + result.message);
  //     }
  //   } catch (error) {
  //     console.error("Error logging in:", error);
  //     alert("Something went wrong. Please try again.");
  //   }
  // });
  function handleFiles(files) {
    console.log(files, "files");

    const selectedFiles = Array.from(files).slice(0, 10 - thumbnails.length);
    selectedFiles.forEach((file) => {
      if (thumbnails.length < 10 && file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);

        thumbnails.push(imageUrl);
        thumbnailsName.push(file.name);
        console.log(thumbnails, thumbnailsName, "kkg");

        displayImages();
      }
    });
  }

  function displayImages() {
    imagePreview.innerHTML = "";
    thumbnails.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      imagePreview.appendChild(img);
    });

    uploadText.style.display = thumbnails.length > 0 ? "none" : "block";
  }

  async function handleUploadPrinting(thumbnailsName) {
    // Ensure `thumbnailsName` is a valid non-empty array
    if (!Array.isArray(thumbnailsName) || thumbnailsName.length === 0) {
      console.error("Invalid or empty thumbnails array.");
      return;
    }

    console.log("Uploading data:", thumbnailsName);

    try {
      const res = await fetch("/api/v2/uploadPrint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: thumbnailsName }), // Send as an array
      });

      // Check if response is OK (status 200-299)
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      // Try parsing response as JSON
      const responseData = await res.json();
      console.log("Server response:", responseData);
      displayAllPrinting(responseData.results);
      // return responseData; // Return data for further handling if needed
    } catch (error) {
      console.error("Upload failed:", error.message);
    }
  }

  function displayAllPrinting(data) {
    tablePreview.innerHTML = "";

    const table = document.createElement("table");
    table.className = "table";

    // Create table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = [
      "No.",
      "Size",
      "Square Feet",
      "Quantity",
      "Sheet",
      "Price",
      "Date",
    ];

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    data.forEach((item, index) => {
      const row = document.createElement("tr");

      const cells = [
        index + 1,
        item.size,
        item.squareFeet,
        item.quantity,
        item.sheet,
        item.price,
        new Date(item.timestamp).toLocaleDateString(),
      ];

      cells.forEach((cellData) => {
        const td = document.createElement("td");
        td.textContent = cellData;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tablePreview.appendChild(table);
  }

  uploadText.style.display = thumbnails.length > 0 ? "none" : "block";
});
