type ApiResponse = {
  statusCode: number;
  body: any;
  message?: string | undefined;
};

export const apiResponse=(statusCode:number,data:any,message?:string):ApiResponse=>{

  return {
    statusCode,
    body:data,
    message
  }
}

