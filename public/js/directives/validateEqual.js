app.directive('validateEquals', ()=>{
    return {
      	require: 'ngModel',
      	link: (scope, element, attrs, ngModelCtrl)=>{
        	function validateEqual(value){
          		const valid = (value === scope.$eval(attrs.validateEquals));
          		ngModelCtrl.$setValidity('equal', valid);
          		return valid ? value: 'undefined';
        	}
        	ngModelCtrl.$parsers.push(validateEqual);
        	ngModelCtrl.$formatters.push(validateEqual);
        	scope.$watch(attrs.validateEquals, () => {
          		ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue);
        	})
      	}
    };
});