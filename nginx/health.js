function health(r) {
    let ret = {
        "overal_status": "OK",
        "api": {
            "version": "1.0.0"
        }
    };
    r.return(200, JSON.stringify(ret));
  }
  
  export default {health}