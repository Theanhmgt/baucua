
var leaveToSignUp = document.querySelector('.leave-to-sign-up');  // form sign in
var leaveToSignIn = document.querySelector('.leave-to-sign-in');  // form sign up
function getParent(element, selector) {
    while(element.parentElement) {
        if(element.parentElement.matches(selector)) {
            return element.parentElement;
        } else {
            element = element.parentElement
        }
    }
}

var parentElementSignIn = getParent(leaveToSignUp, '.sign-in-container');
var parentElementSignUp = getParent(leaveToSignIn, '.sign-up-container');


leaveToSignUp.onclick = function() {
    parentElementSignIn.classList.add('active')

    if(parentElementSignIn.classList.length == 2)
    parentElementSignUp.classList.remove('active')
};

leaveToSignIn.onclick = function() {
    parentElementSignUp.classList.add('active')
    
    if(parentElementSignUp.classList.length == 2)
    parentElementSignIn.classList.remove('active')
};