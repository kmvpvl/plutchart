function health(r) {
    r.return(200, {
        "overal_status": "OK",
        "api": {
            "version": "1.0.0"
        }
    });
  }
  
  export default {hello}