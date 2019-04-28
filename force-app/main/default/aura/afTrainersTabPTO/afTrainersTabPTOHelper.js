({
    //Responsible for server callback and filtering results for trainer by when PTOs are planned
    getData : function(component, event) {
        var userId = event.getParam("trainerId");
        component.set("v.userId",userId);
        
        //Gets current date in order to compare values in if statement below
        var currentDate = new Date();
        var todaysYear 	= currentDate.getUTCFullYear();
        var todaysMonth = currentDate.getUTCMonth() ;
        var todaysDate 	= currentDate.getUTCDate() ;
        
        currentDate = (todaysYear + "-0" + (todaysMonth+1) + "-0" + todaysDate);       
        let action = component.get("c.getTrainingPTOById");
        action.setParams({"userId" : userId});
        action.setCallback(this, function(response){
            let state = response.getState();
            
            if (component.isValid && state === "SUCCESS"){
                
                var temp = response.getReturnValue();
                
                //if response value is empty hasPTO will be false and will not render both data tables
                if(temp.length == 0){
                    component.set('v.hasPTO', false);
                    component.set('v.selectedPTO', true);
                }
                //if response value is not empty hasPTO will be true and will render both data tables
                else if (temp.length > 0){
                    component.set('v.hasPTO', true);
                    component.set('v.selectedPTO', true);
                }
                
                var tempCurrent = [];
                var tempFuture = [];
                
                /*Loops through all the response values searches and then filters by status to determine
                whether a batch should be on the current PTOs data table or upcoming PTOs data table
                */
                for(var i = 0; i < temp.length; i++)
                {
                    
                    if(temp[i].Status__c == 'Pending Approval' && temp[i].StartDate__c > currentDate)
                            {
                                var tempFutureCounter = 0;
                                tempFuture.push(temp[i]);
                                
                                
                            }
                }
                for(var i = 0; i < temp.length; i++)
                {
                    if(temp[i].Status__c  == 'Approved'){
                        tempCurrent.push(temp[i]);
                    }
                }
                //Calls modGetData which is responsible for putting values on data table
                this.modGetData(component, tempCurrent, tempFuture);
            }
            else if (state === "ERROR"){
                let errors = response.getError();
                console.error(errors);
            }
        });
        $A.enqueueAction(action);
        
    },
    //Modifies incoming data in order for the lightning data table to display it
    modGetData : function(component, tempCurrent, tempFuture){
        //Sets returnedTraining and returnedFutureTrainings to values from getData
        var returnedPTOs = tempCurrent;
        var returnedFuturePTOs = tempFuture;
        var PTOs = [];
        var futurePTOs = [];
        
        //Loops through an array of current PTOs in order to show values on data table
        for(var i = 0 ; i < returnedPTOs.length ; i++){
            var tempObj = returnedPTOs[i];
            var endDateString = new Date(tempObj.EndDate__c);
            var startDateString = new Date(tempObj.StartDate__c);
            //var endDate =  this.endDateHandler(endDateString);
            //var startDate = this.startDateHandler(startDateString);
            PTOs.push(this.addToArray(tempObj , endDateString, startDateString));
            
        }
        //Loops through an array of upcoming PTOs  in order to show values on the upcoming PTOs datatable
        for(var j = 0; j < returnedFuturePTOs.length; j++){
            var tempObj = returnedFuturePTOs[j];
            var endDateString = new Date(tempObj.EndDate__c );
            var startDateString = new Date(tempObj.StartDate__c );
            //var endDate =  this.endDateHandler(endDateString);
            //var startDate = this.startDateHandler(startDateString);
            futurePTOs.push(this.addToArray(tempObj , endDateString, startDateString));
        }

        // Two sets of if-else statements to determine whether to display the Approved PTO and Upcoming PTO tables

        console.log("PTO List: " + PTOs);

        console.log("UpcomingPTO List: " + futurePTOs);

        if(PTOs === undefined || PTOs.length == 0){
            component.set('v.hasApprovedPTO', false);
        } else {
            component.set('v.hasApprovedPTO', true);
        }
        if(futurePTOs === undefined || futurePTOs.length == 0){
            component.set('v.hasUpcomingPTO', false);
        } else {
            component.set('v.hasUpcomingPTO', true);
        }
        var i = component.get('v.hasApprovedPTO');
        var j = component.get('v.hasUpcomingPTO');
        console.log("has Approved: " + i);
        console.log("has Upcoming: " + j);
        
        //sets the values from trainings to current PTOs datatable and futureTrainings to upcoming PTOs table
        component.set('v.empCurrentPTODataset', PTOs);
        component.set('v.empFuturePTODataset', futurePTOs);
        
    },
    
    //Called from modeGetData to reference key value pairs
    addToArray : function(tempObj, endDateString, startDateString){
        var startYear = startDateString.getUTCFullYear();
        var startMonth = startDateString.getUTCMonth();
        var startDay =  startDateString.getUTCDate();
        var endYear = endDateString.getUTCFullYear();
        var endMonth = endDateString.getUTCMonth();
        var endDay =  endDateString.getUTCDate();
        var tempArray = {
            startDate : startDateString = new Date(startYear, startMonth, startDay + 1) ,
            endDate : endDateString = new Date(endYear, endMonth,endDay + 1) ,
            status : tempObj.Status__c,
            reason : tempObj.Reason__c,
            Id : tempObj.Id
        };
        return tempArray;
    },

    //Helper for collapsible sections
    helperDisplay : function(component,event,secId) {
        var acc = component.find(secId);
            for(var cmp in acc) {
            $A.util.toggleClass(acc[cmp], 'slds-show');  
            $A.util.toggleClass(acc[cmp], 'slds-hide');  
        }
    }, 
})