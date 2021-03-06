var express = require("express");
var router = express.Router();

var { getConnection } = require("../dbapi/dbapi.js");

//name,assetId,assetType,supply,numberOfTransactions


router.get("/verified", function(req, res, next) {
  let page = req.query.page || 0;
  let size = req.query.size || 100;
  let index = parseInt( req.query.index || -1 )
 
  page = parseInt(page);
  size = parseInt(size);

  if (size > 100 || size < 1 || isNaN(size)) {
    console.log("size ", size);
    size = 100;
  }

  if (isNaN(page)) {
    page = 0;
  }

  if ( isNaN(index) ) {
    index = -1
  }

  getConnection().then(conn => {
    conn
      .query(`SELECT * FROM fusionAssetLink.assets limit ?,?`, [
        (index>=0 ? index : page*size),
        size
      ])
      .then(rows => {
        res.json(rows);
      })
      .finally(() => {
        conn.release();
      });
  });

});

/* GET assets listing. */
// http://localhost:3000/assets/
//
/*** examples
 *
 *   http://localhost:3000/assets/0xbbd28ab973a7be78af3d8a3c3f1097c87fc020b2bd9270aa292518e8a93c32ae
 *   http://localhost:3000/assets/all?page=0&size=2&sort=desc
 *
 */
router.get("/:asset", function(req, res, next) {
  let page = req.query.page || 0;
  let size = req.query.size || 20;
  let sort = req.query.sort === 'desc' ? 'desc' : 'asc'
  let index = parseInt( req.query.index || -1 )
 
  page = parseInt(page);
  size = parseInt(size);

  if (size > 100 || size < 1 || isNaN(size)) {
    console.log("size ", size);
    size = 100;
  }

  if (isNaN(page)) {
    page = 0;
  }

  if ( isNaN(index) ) {
    index = -1
  }

  // SELECT * FROM transactions where fusionCommand = 'GenAssetFunc' order by lower(commandExtra2)

  if (req.params.asset === "all") {
    getConnection().then(conn => {
      conn
        .query(`SELECT * FROM transactions where fusionCommand = 'GenAssetFunc' order by lower(commandExtra2) ${sort}, timeStamp ${sort} limit ?,?`, [
          (index>=0 ? index : page*size),
          size
        ])
        .then(rows => {
          res.json(rows);
        })
        .finally(() => {
          conn.release();
        });
    });
  } else {
    getConnection().then(conn => {
      conn
        .query("select * from transactions where fusionCommand = 'GenAssetFunc' and commandExtra = ? ", [
          req.params.asset
        ])
        .then(rows => {
          res.json(rows);
        })
        .finally(() => {
          conn.release();
        });
    });
  }
});



module.exports = router;
