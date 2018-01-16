const ajaxCalls = ($http) => {

    const ajaxCall = (url, method, data) => $http({url, method, data});
    
    const uploadFile = formData => $http({url: 'super/upload',method: 'POST',data: formData, headers: {'Content-Type': undefined}});
    
    return {
        ajaxCall,
        uploadFile
    }
}

app.factory('SuperServices', ajaxCalls);