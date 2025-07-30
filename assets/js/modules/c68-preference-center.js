(function (d) {
	d.addEventListener("DOMContentLoaded", function (_event) {
		const config = { attributes: false, childList: true, subtree: true };
		d.querySelectorAll(".c68.preference-center").forEach((elem) => {
			const formmutation = function (mutationsList) {
				for (const mutation of mutationsList) {
					const form = [...mutation.addedNodes].find((n) => n.nodeName === "FORM");
					if (!form) return;
					if (form.querySelector(".pc-preference-header-section").style.display == 'block') {
						elem.querySelector(".success-updatepreferences").classList.remove("d-none");
					}
					else {
						elem.querySelector(".success-subscribe").classList.remove("d-none");
					}
				}
			};
			const observer = new MutationObserver(formmutation);
			observer.observe(elem, config);
		});
	});
})(document);