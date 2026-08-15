/* IndexedDB persistence, wired to Elm through exactly one pair of ports
 * (Ports.elm: `saveToDb` out, `loadFromDb` in). Everything the app persists
 * — the question bank, every test, and config like the active test id —
 * travels as a single JSON blob through that pair; there is no per-record
 * store or per-field port.
 *
 * Storage shape: one IndexedDB database (`qbank-db`), one object store
 * (`state`), one fixed record (`put(value, "root")`).
 */
(function () {
  "use strict";

  var DB_NAME = "qbank-db";
  var DB_VERSION = 1;
  var STORE_NAME = "state";
  var ROOT_KEY = "root";

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var idb = e.target.result;
        if (!idb.objectStoreNames.contains(STORE_NAME)) {
          idb.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = function (e) {
        resolve(e.target.result);
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  }

  function idbGet(db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, "readonly");
      var req = tx.objectStore(STORE_NAME).get(ROOT_KEY);
      req.onsuccess = function () {
        resolve(req.result === undefined ? null : req.result);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function idbPut(db, value) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, ROOT_KEY);
      tx.oncomplete = function () {
        resolve();
      };
      tx.onerror = function () {
        reject(tx.error);
      };
    });
  }

  window.QBankDb = {
    /**
     * Opens the database, reads the persisted blob (if any), and wires
     * the two ports on `app.ports`. Sends exactly one "loaded" message.
     */
    init: function (app) {
      var db = null;
      var dbAvailable = !!window.indexedDB;

      function send(envelope) {
        app.ports.loadFromDb.send(envelope);
      }

      if (!dbAvailable) {
        send({
          kind: "loaded",
          dbAvailable: false,
          dbErrorMsg:
            "IndexedDB isn't available in this environment — changes will only last for this session. Open this file directly in a browser tab (outside any embedded preview) to get persistent storage.",
          data: null,
        });
      } else {
        openDB()
          .then(function (opened) {
            db = opened;
            return idbGet(db);
          })
          .then(function (data) {
            send({ kind: "loaded", dbAvailable: true, dbErrorMsg: "", data: data });
          })
          .catch(function () {
            dbAvailable = false;
            send({
              kind: "loaded",
              dbAvailable: false,
              dbErrorMsg:
                "Couldn't open IndexedDB — starting a fresh in-memory session (nothing will be saved on reload). Try opening this file directly in a browser tab instead of an embedded preview.",
              data: null,
            });
          });
      }

      app.ports.saveToDb.subscribe(function (payload) {
        if (!dbAvailable || !db) return;
        idbPut(db, payload).catch(function (err) {
          send({ kind: "saveError", message: String(err) });
        });
      });
    },
  };
})();
