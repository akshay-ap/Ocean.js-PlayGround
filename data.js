const dummyAsset = {
  main: {
    type: "dataset",
    name: "test-dataset",
    dateCreated: new Date(Date.now()).toISOString().split(".")[0] + "Z",
    author: "test",
    license: "MIT",
    files: [
      {
        url:
          "https://file-examples-com.github.io/uploads/2017/02/file_example_XLS_10.xls",
        contentType: "xlsx",
      },
    ],
  },
};

module.exports = { dummyAsset };
