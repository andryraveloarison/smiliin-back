class MainError extends Error{
    status: number
    
    constructor(errorMessage, errorType=null){
        super()
       
        this.name = this.constructor.name
        this.message = errorMessage
 
        switch(this.constructor.name){
            case 'AuthenticationError':
                if(errorType == 0){
                    this.status = 400
                }else if(errorType == 1){
                    this.status = 404
                }else{
                    this.status = 401
                }
                break
            case 'UserError':
                if(errorType == 0){
                    this.status = 404
                }else{
                    this.status = 409
                }
                break
            case 'TicketError':
                if(errorType == 0){
                    this.status = 404
                }else{
                    this.status = 409
                }
                break
            case 'RequestError':
                this.status = 400
                break
            case 'AuthorizationError':
                this.status = 403
            default:
                console.log('No handler for that')
        }

    }
}

class AuthenticationError extends MainError{}
class UserError extends MainError{}
class TicketError extends MainError{}
class RequestError extends MainError{}
class StatuError extends MainError{}
class AuthorizationError extends MainError{}

module.exports = { MainError, AuthenticationError, UserError, TicketError, RequestError, StatuError, AuthorizationError}