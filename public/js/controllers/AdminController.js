app.controller('adminController', ($scope, $http, SuperServices) => {
	SuperServices.ajaxCall('auth/fetchUser', 'get').then(({data}) => data.user.role !== 'admin' ? window.location.href="/" : $scope.adminAuth = true).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));

	$scope.fetchCategories = (cb) => {
		SuperServices.ajaxCall('super/categories', 'get').then(({data}) => {
			if(data.success){
				$scope.categories = data.data;
				cb ? cb() : null;
			}
		}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
	}

	$scope.addCtg = () => existCategory($scope.ctg) ? $scope.err="Category is already exist" : createCtg();

	const existCategory = name => $scope.categories.find(current => current.name === name.toLowerCase());

	const createCtg = () => SuperServices.ajaxCall('super/category','put', {name: $scope.ctg.toLowerCase()}).then(({data}) => {
		if(data.success){
			$scope.fetchCategories(() => $scope.category = $scope.categories[$scope.categories.length-1]._id);
		}
	})

	$scope.addProduct = () => {
        if(document.getElementById('myfile').files[0]){
        	$scope.imgErr = "";
        	return uploadImg((err, path) => err ? $scope.imgErr = err : saveProductDetails('super/', 'put', {name: $scope.name.toLowerCase(), price: $scope.price, image: path, cid: $scope.category}));
        }
        return $scope.imgErr = "Please upload an image";
	}

	const uploadImg = (cb) => {
		const file = document.getElementById('myfile');
		const imageExtension = file.files[0].name.split(".").pop();
		const formData = new FormData();
        formData.append('sampleFile', file.files[0]);
		if(imgValidation(imageExtension)){
			return SuperServices.uploadFile(formData).then(({data}) => data.success ? cb(null, data.path) : cb('Image upload was faild. Try again.'))
		}
		return cb('Please choose a valid image file');  
	}

	$scope.editProduct = (e, id, quantity) => {
		$scope.currentProduct = findProduct(id)[0];
		$scope.name = $scope.currentProduct.name;
		$scope.price = $scope.currentProduct.price;
		$('.img-selected img').attr('src', $scope.currentProduct.image);
		$scope.updateMode = true;
		$scope.screenOpen = true;
		$scope.currentCtg = $('.activeCtg').attr('id');
	}

	$scope.updateProduct = () => {
		if(document.getElementById('myfile').files[0]){
			return uploadImg((err, path) => err ? $scope.imgErr=err : saveProductDetails('super/update', 'patch', {_id: $scope.currentProduct._id, name: $scope.name.toLowerCase(), price: $scope.price, image: path}));
		}
		return saveProductDetails('super/update', 'patch', {_id: $scope.currentProduct._id, name: $scope.name.toLowerCase(), price: $scope.price})
	}

	const saveProductDetails = (url, method, product) => {
		SuperServices.ajaxCall(url, method, product).then(({data}) => {
			if(data.success){
				$scope.success = "The changes were saved successfully";
				$scope.category ? $scope.fetchProductsByCategory($scope.category) : $scope.fetchProductsByCategory($scope.currentCtg)
				cleanForm();
			}
		}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
	}

	const cleanForm = () => {
		$scope.name = '';
		$scope.price = '';
		$scope.imgErr = '';
		$scope.err = '';
		$scope.updateMode = false;
		$scope.category = '';
		$('.img-selected img').attr('src', "");
		document.getElementById('myfile').value="";
	}

	const findProduct = (id) => $scope.products.filter(({_id}) => id === _id);

	$scope.fetchProductsByCategory = (id) => {
		SuperServices.ajaxCall('super/products/id/' + id, 'get').then(({data})=>{
      		if(data.success){
      			$scope.products = data.data;
      			$('#buttons-wrapper li').removeClass('activeCtg');
      			$('#' + id).addClass('activeCtg');
      		}
    	}).catch(({status}) => status === 401 ? window.location.href="/" : console.log(status));
    }

	$("#myfile").change(function() {
	   	if(this.files && this.files[0]) {
		    const reader = new FileReader();
		    reader.onload = (e) => $('.img-selected img').attr('src', e.target.result);
		    reader.readAsDataURL(this.files[0]);
		}
	});

	$scope.openFormScreen = () => {
		$scope.screenOpen = true;
		cleanForm();
	}

	const imgValidation = (imageExtension) => jQuery.inArray(imageExtension.toLowerCase(), ['png', 'jpg', 'jpeg']) == -1 ? false : true;

	$('#nav-icon1, #nav-icon2').click(function(){
		$(this).toggleClass('open');
	});

	$(".toggle").click(() => $(".navcollaps").toggleClass("show"));
});


