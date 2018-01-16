app.controller('SuperController', ($scope, $http, SuperServices) => {
	$scope.shoppingStep = true;
	$scope.numbers = [1,2,3,4,5,6,7,8,9,10];
	$scope.pattern = /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
	SuperServices.ajaxCall('super/categories', 'get').then(({data}) => $scope.categories = data.data)

  	SuperServices.ajaxCall('auth/fetchUser', 'get').then(({data}) => authorizedUser(data)).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));

    const authorizedUser = (data) => {
    	$scope.currentUser = data.user;
    	$scope.fullName = data.user.profile ? data.user.profile.displayName : data.user.firstName + ' ' + data.user.lastName;
    	$scope.authorized = true;
    	if(data.openCart){
    		continueShopping(data.openCart);
    	}
    }

    const continueShopping = (cart) => $scope.cart = cart;

	const findProduct = id => $scope.products.filter(({_id}) => id === _id)[0];
	const findProductInCart = id => $scope.cart.items.filter(current => current.products._id === id)[0].products;

	$scope.removeProduct = (id) => {
		SuperServices.ajaxCall('super/' + id, 'delete').then(({data})=> {
			if(data.success){
				data.data ? continueShopping(data.data) : continueShopping();
			}
		}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
	}

	$scope.fetchProductsByCategory = (id) => {
		$scope.waiting = true;
		$scope.products = [];
		SuperServices.ajaxCall('super/products/id/' + id, 'get').then(({data})=>{
      		if(data.success){
      			$('#buttons-wrapper li').removeClass('activeCtg');
      			$('#' + id).addClass('activeCtg');
      			$scope.waiting = false;
      			$scope.products = data.data;
      		}
    	}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
    }

	$scope.fetchCity = () => $scope.city = $scope.currentUser.city;
	
	$scope.fetchStreet = () => $scope.street = $scope.currentUser.street;
	
	$scope.toCashier = () => $scope.cart ? $scope.toggleSteps() : $scope.emptyErr=true;

	SuperServices.ajaxCall('super/dates', 'get').then(({data}) => {
		const disabledDates = [];
		data.data.forEach(current => {
			if(current.count >= 3){
				disabledDates.push(moment(current._id));
			}
		})
		$(() =>$('#datetimepicker1').datetimepicker({format: 'MM/DD/YYYY', pickTime: false, disabledDates, minDate : new Date()}));
	}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));

	$scope.toggleSteps = () => $scope.shoppingStep = !$scope.shoppingStep;

	$scope.checkout = (city, street, creditCard) => $("#datetimepicker1").find("input").val() === "" ? $scope.dateErr=true : makeOrder(city, street, creditCard);

	const makeOrder = (city, street, creditCard) => {
		const obj = {city, street, creditCard, shippingDate: $("#datetimepicker1").find("input").val()};
		SuperServices.ajaxCall('super/order/', 'put', obj).then(({data}) => data.success ? $('.window').css('display', 'block') : $scope.orderErr=true).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
	}
	
	$scope.emptyCart = () => {
		SuperServices.ajaxCall('super/', 'delete').then(({data}) => {
			if(data.success){
				continueShopping()
			}
		}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
	}

	 $scope.updateCart = ($e, id, quantity) => {
	 	const products = $e.currentTarget.className.split(" ").pop() === "cartBtn" ? findProductInCart(id) : findProduct(id);
	 	SuperServices.ajaxCall('/super/cart', 'patch', {products, quantity}).then(({data}) => { 
			if(data.success){
				continueShopping(data.data);
				if($e.currentTarget.className.split(" ").pop() === "containerBtn"){
					previewSuccessIcon($e);
				}
			}
		}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
	}

	const previewSuccessIcon = ($e) => {
		$e.currentTarget.parentNode.nextElementSibling.style.opacity = "1";
		setTimeout(() => $e.currentTarget.parentNode.nextElementSibling.style.opacity = "0", 3000)
	}

	$scope.searchInReceipt = (name) => $scope.pname.length > 0 ? markProducts($scope.pname.toLowerCase()) : $('.product-name').removeClass('marked');

	const markProducts = name => {
		$('.product-name').each(function() {
			$(this).text().toLowerCase().indexOf(name)!=-1 ? $(this).addClass('marked') : $(this).removeClass('marked');
		})
	}

	$('#nav-icon1, #nav-icon2').click(function(){
		$(this).toggleClass('open');
		if(!$(this).hasClass('toggle')){
			$('.navbar').toggleClass('ctg-nav-hidden');
		}	
	});

	$(".toggle").click(() => $(".navcollaps").toggleClass("show"));

	$scope.toggleCart = () => {
		$('.cart').toggleClass('opened').toggleClass('minimized');
		$('.main-wrapper').toggleClass('streched').toggleClass('unstreched');
	}
})