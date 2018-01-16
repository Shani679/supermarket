app.directive('inputSearch', SuperServices  => {
    return {
    	restrict: 'E',
    	scope: {products: `=data`, show: `=visible`},
	    template: `<input type="text" ng-show="show" id="search" placeholder="Search for a product" ng-model="product" ng-keyup="fetch(product)">`,
	    link: (scope, element, attrs) => scope.fetch = (val) => val.length > 1 ? SuperServices.ajaxCall('super/products/name/' + val, 'get').then(({data}) => scope.products = data.data) : scope.products = []
    }
});
