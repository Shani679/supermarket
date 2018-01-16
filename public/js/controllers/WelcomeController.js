app.controller('LoginController', ($scope, $http, SuperServices) => {
	$scope.cities = ['tel aviv', 'ramat gan', 'qiryat ono', 'beer sheva', 'ashdod', 'haifa', 'hertzeliya', 'petch tiqva', "kfar saba", 'jerusalem', 'rehovot'];
    $scope.pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    $scope.waiting = true;

    SuperServices.ajaxCall('auth/fetchUser', 'get').then(({data}) => authorizedUser(data)).catch(err=> $scope.waiting = false)

	$scope.displayLoader = () => $scope.submitted = true;

	SuperServices.ajaxCall('/details', 'get').then(({data}) => $scope.superData = data);
    
	const authorizedUser = (data) => {
		if(data.user.role === 'admin'){
			return window.location.href="admin.html";
		}
		$scope.waiting = false;
		$scope.fullName = data.user.profile ? data.user.profile.displayName : data.user.firstName + ' ' + data.user.lastName;
		$scope.authorized = true;
		$scope.shoppingStatus = data.openCart ? continueShopping(data) : startShopping(data);
	}

	const continueShopping = (data) => {
		$scope.openCart = data.openCart;
        return 'Continue Shopping';
	}

	const startShopping = (data) => {
		if(data.lastOrder){
			$scope.lastOrder = data.lastOrder;
		}
		return 'Start Shopping';
	}

	$scope.shopping = () => window.location.href="supermarket.html";
   
    $scope.checkUser = (user) => SuperServices.ajaxCall('/userExist/' + user, 'get').then(({data}) => $scope.userExist = data.userExist ? true : false);
	
	$scope.toggleSteps = () => $scope.register = !$scope.register;
});
