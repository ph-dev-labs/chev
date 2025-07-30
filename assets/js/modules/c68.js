(function (d) {
	let lastSubmittedformId = null;

	d.addEventListener("DOMContentLoaded", function (_event) {
		const config = { attributes: false, childList: true, subtree: true };
		d.querySelectorAll(".c68").forEach((c68) => {
			function damerauLevenshteinDistance(source, target) {
				if (!source) return target ? target.length : 0;
				if (!target) return source.length;
				const d = [];
				for (let i = 0; i <= source.length; i++) {
					d[i] = [i];
				}
				for (let j = 0; j <= target.length; j++) {
					d[0][j] = j;
				}
				for (let i = 1; i <= source.length; i++) {
					for (let j = 1; j <= target.length; j++) {
						let cost = (source[i - 1] === target[j - 1]) ? 0 : 1;
						d[i][j] = Math.min(
							d[i - 1][j] + 1, // Deletion
							d[i][j - 1] + 1, // Insertion
							d[i - 1][j - 1] + cost // Substitution
						);
						if (i > 1 && j > 1 && source[i - 1] === target[j - 2] && source[i - 2] === target[j - 1]) {
							d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // Transposition
						}
					}
				}
				return d[source.length][target.length];
			}
			function getOffsetTopToAncestor(element, ancestor) {
				let offsetTop = 0;
				let currentElement = element;
				while (currentElement && currentElement !== ancestor) {
					offsetTop += currentElement.offsetTop;
					currentElement = currentElement.parentElement;
				}
				// If the ancestor is not found in the element's offsetParent chain,
				// return 0 or throw an error, depending on desired behavior.
				if (currentElement !== ancestor) {
					console.warn("Ancestor not found in the element's offsetParent chain.");
					return 0; // Or throw new Error("Ancestor not found");
				}
				return offsetTop;
			}
			function createPopover(targetElement, validate) {
				const parentElement = targetElement.parentElement;
				// Check if a popover already exists for the target element
				let existingPopover = parentElement.querySelector('.popover');
				if (existingPopover) {
					return existingPopover; // Return the existing popover
				}

				// Create a unique ID for the popover
				const popoverId = `popover-${Math.random().toString(36).substr(2, 9)}`;

				// Create the popover structure
				const popoverDiv = document.createElement('div');
				popoverDiv.className = 'custom-popover popover bs-popover-bottom fade'; // Add Bootstrap-like classes
				popoverDiv.setAttribute('role', 'tooltip');
				popoverDiv.setAttribute('data-popper-placemen', 'bottom');
				popoverDiv.setAttribute('id', popoverId); // Assign the unique ID

				// Add the inner HTML structure
				popoverDiv.innerHTML = `
					<div class="popover-flex">
						<div class="popover-body"></div>
						<a href="#" class="close cta-link color-light-red" aria-label="Close">
							<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
							<span class="sr-only">Close</span>
						</a>
					</div>
				`;

				// Attach the popover to the parent element
				parentElement.appendChild(popoverDiv);

				// Add a method to close the popover and remove the aria-describedby attribute
				popoverDiv.closePopover = function () {
					popoverDiv.classList.remove('show'); // Hide the popover
					targetElement.removeAttribute('aria-describedby'); // Remove the aria-describedby attribute
					parentElement.removeChild(popoverDiv); // Remove the popover from the parent element
				};
				popoverDiv.addEventListener("click", (e) => {
					const target = e.target;
					if (target.classList.contains("email-suggestion-link") || target.closest("a").classList.contains("email-suggestion-link")) {
						e.preventDefault();
						targetElement.value = target.textContent;
						targetElement.focus(); // Focus back on the email input
						validate.element(targetElement);
                        popoverDiv.closePopover(); // Close the popover

					} else if (target.classList.contains("close") || target.closest("a").classList.contains("close")) {
						e.preventDefault();
						popoverDiv.closePopover();
					}
				});

				// Add a method to show the popover and set the aria-describedby attribute
				popoverDiv.showPopover = function (content = "") {
					// Set the content of the popover
					if (content.body) {
						popoverDiv.querySelector('.popover-body').innerHTML = content.body;
					}
					const position = { top: getOffsetTopToAncestor(targetElement, parentElement) + targetElement.offsetHeight + 20, left: targetElement.offsetLeft }
					// Position the popover relative to the target element
					popoverDiv.style.top = `${position.top}px`;
					popoverDiv.style.left = `${position.left}px`;

					// Display the popover
					popoverDiv.classList.add('show');

					// Ensure the aria-describedby attribute is set
					targetElement.setAttribute('aria-describedby', popoverId);
				};

				// Return the newly created popover
				return popoverDiv;
			}
			function checkEmailDomainSuggestions(elem, emailInput, validate) {
				const config = elem.dataset.cvxEmailDomainSuggestions ? JSON.parse(elem.dataset.cvxEmailDomainSuggestions) : { distance: 3, domains: ['gmail.com'] };
				const emailValue = emailInput.value || "";
				const domain = emailValue.split('@')[1];
				const exactMatch = config.domains.includes(domain);

				const popover = createPopover(emailInput, validate);
				// Exit if the domain is an exact match
				if (exactMatch) {
					//if (popover.tip) popover.hide();
                    popover.closePopover(); // Close the popover if it exists
					return;
				};
				if (domain && domain.length >= 2) {
					// Find all domains with a distance <= 2
					const closeMatches = config.domains.filter((current) => {
						const distance = damerauLevenshteinDistance(current, domain);
						//console.log(`distance between ${current} and ${domain}:`, distance);
						return distance <= config.distance;
					});
					if (closeMatches.length > 0) {
						const matches = `<span class="suggestions type-body text-caption color-light-red">Did you mean:
								${closeMatches.map((match, index) => {
							const separator = index < closeMatches.length - 1 ? ', ' : ''; // Add a comma and space if not the last item
							return `<a href="#" class="cta email-suggestion-link">${emailValue.split('@')[0]}@${match}</a>${separator}`;
								}).join('')}
							</span>`;
						popover.showPopover({ body: matches });
						return; // Exit the function after showing suggestions
					}
                    popover.closePopover(); // Close the popover if it exists
					return;
				}
                popover.closePopover(); // Close the popover if it exists
			}
			function handleFormLoad(elem) {
				const form = elem.querySelector("form");
				$.validator.unobtrusive.parse($(form));
				const validationRules = $(form).data("validator").settings.rules;
				const requiredInputs = Object.entries(validationRules).filter(([_key, value]) => value.required === true);
				requiredInputs.forEach(requiredInput => {
					const input = form.querySelector(`[name="${requiredInput[0]}"]`);
					input.classList.add("required-input");
				});
				const validate = $(form).validate();
				const emailInput = form.querySelector('input[type="email"]');
				if (emailInput) {
					emailInput.addEventListener("input",
						globalNamespace.debounce(() => {
							checkEmailDomainSuggestions(elem, emailInput, validate);
						})
					);
				}

				//handle form load
				form.addEventListener("submit", function (e) {
					lastSubmittedformId = form.id;
					const valid = $(form).valid();
					if (!valid) {
						e.preventDefault();
						return;
					}
					c68.classList.add("form-submitted");
				});
			}
			handleFormLoad(c68);
			const formmutation = function (mutationsList) {
				for (const mutation of mutationsList) {
					const form = [...mutation.addedNodes].find((n) => n.nodeName === "FORM");
					if (!form) return;
					if (c68.classList.contains("form-submitted")) {
						if (form.querySelector('div.validation-summary-errors')) {
							form.classList.add("d-none");
							form.closest('div').querySelector('.error-message').classList.remove("d-none");
						}
						else {
							form.classList.add("d-none");
							c68.querySelector(".success-message").classList.remove("d-none");
							return;
						}
					}
					handleFormLoad(form);
				}
			};
			const observer = new MutationObserver(formmutation);
			observer.observe(c68, config);
		});

		window.ajaxFailure = function (xhr, status, error) {
			if (lastSubmittedformId != null) {
				const form = document.querySelector("#" + lastSubmittedformId);
				form.classList.add("d-none");
				form.closest('div').querySelector('.error-message').classList.remove("d-none");
			}
		}
	});

})(document);