function health(r) {
    let ret = {
        "overal_status": "OK",
        "api": {
            "version": "1.0.0"
        }
    };
    r.setReturnValue(ret);
  }
  
  export default {health}