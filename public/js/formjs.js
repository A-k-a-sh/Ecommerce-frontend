let inputFields = document.querySelectorAll('input[type="text"], textarea, input[type="number"] , input[type="file"]');
let form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    let isValid = true;

    e.preventDefault();

    inputFields.forEach(input => {
        const inputName = input.name;
        const value = input.value.trim();
        const isPriceField = input.name === 'price';
        const priceValue = parseFloat(value);

        // Only validate fields with a name attribute
        if (inputName && ((inputName !== 'image' && value === '') || 
            (isPriceField && (priceValue < 0 || isNaN(priceValue))))) {
            console.log(`Invalid field: ${inputName}, value: ${value}`);
            input.classList.add('border-b-1', 'border-b-red-500');
            isValid = false;
        } else if (inputName) { 
            // Remove error styling if validation passes
            input.classList.remove('border-b-1', 'border-b-red-500');
        }
    });

    console.log(`Form valid status: ${isValid}`);
    
    // Prevent form submission if validation fails


    if (!isValid) {
        e.preventDefault();
    }
    else{
        form.submit();
    }
    
});
