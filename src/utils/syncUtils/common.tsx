import BookModel from "../../model/Book";
import localforage from "localforage";

export function getParamsFromUrl() {
  var hashParams: any = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q =
      window.location.hash.substring(2) ||
      window.location.search.substring(1).split("#")[0];

  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}
export const moveData = (
  blob,
  driveIndex,
  books: BookModel[] = [],
  handleFinish: () => void = () => {}
) => {
  let file = new File([blob], "config.zip", {
    lastModified: new Date().getTime(),
    type: blob.type,
  });
  const fs = window.require("fs");
  const path = window.require("path");
  const { remote, app } = window.require("electron");
  const AdmZip = window.require("adm-zip");

  const configDir = (app || remote.app).getPath("userData");
  const dirPath = path.join(configDir, "uploads");
  const dataPath = localStorage.getItem("storageLocation")
    ? localStorage.getItem("storageLocation")
    : window
        .require("electron")
        .ipcRenderer.sendSync("storage-location", "ping");
  var reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = async (event) => {
    fs.writeFileSync(
      path.join(dirPath, file.name),
      Buffer.from(event.target!.result as any)
    );
    var zip = new AdmZip(path.join(dirPath, file.name));
    zip.extractAllTo(/*target path*/ dataPath, /*overwrite*/ true);
    const fs_extra = window.require("fs-extra");
    fs_extra.copy(
      path.join(dirPath, file.name),
      path.join(dataPath, file.name),
      function (err) {
        if (err) return;
      }
    );
    if (driveIndex === 4) {
      let deleteBooks = books.map((item) => {
        return localforage.removeItem(item.key);
      });
      await Promise.all(deleteBooks);
    }
    if (driveIndex === 5) {
      handleFinish();
    }
  };
};

class SyncUtil {
  static changeLocation(
    oldPath: string,
    newPath: string,
    handleMessage: (message: string) => void,
    handleMessageBox: (isShow: boolean) => void,
    syncFromLocation: () => void = () => {}
  ) {
    const fs = window.require("fs-extra");
    try {
      fs.readdir(newPath, (err, files: string[]) => {
        let isConfiged: boolean = false;
        files.forEach((file: string) => {
          if (file === "config.zip") {
            isConfiged = true;
          }
        });
        if (isConfiged) {
          localStorage.setItem("storageLocation", newPath);
          syncFromLocation();
        } else {
          fs.copy(oldPath, newPath, function (err) {
            if (err) return;
            fs.emptyDirSync(oldPath);
            handleMessage("Change Successfully");
            handleMessageBox(true);
          });
        }
      });
    } catch (error) {
      handleMessage("Change Failed");
      handleMessageBox(true);
    }
  }
  static syncData(
    blob,
    driveIndex,
    books: BookModel[] = [],
    handleFinish: () => void = () => {}
  ) {
    let file = new File([blob], "config.zip", {
      lastModified: new Date().getTime(),
      type: blob.type,
    });
    const fs = window.require("fs");
    const path = window.require("path");
    const AdmZip = window.require("adm-zip");
    const dataPath = localStorage.getItem("storageLocation")
      ? localStorage.getItem("storageLocation")
      : window
          .require("electron")
          .ipcRenderer.sendSync("storage-location", "ping");
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event) => {
      fs.writeFileSync(
        path.join(dataPath, file.name),
        Buffer.from(event.target!.result as any)
      );
      var zip = new AdmZip(path.join(dataPath, file.name));
      zip.extractAllTo(/*target path*/ dataPath, /*overwrite*/ true);

      if (driveIndex === 4) {
        let deleteBooks = books.map((item) => {
          return localforage.removeItem(item.key);
        });
        await Promise.all(deleteBooks);
      }
      if (driveIndex === 5) {
        handleFinish();
      }
    };
  }
}

export default SyncUtil;
