(function() {


	/**
	 * UTILITIES
	 */

	function hasClass(el, className) {
		if (el.classList) {
			return el.classList.contains(className);
		} else {
			return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
		}
	}

	function addClass(el, classNames) {
		classNames = classNames.split(/\s+/);
		for (var i = 0; i < classNames.length; i++) {
			var className = classNames[i];
			if (el.classList) {
				el.classList.add(className);
			} else if (!hasClass(el, className)) {
				el.className += " " + className;
			}
		}
	}

	function removeClass(el, classNames) {
		classNames = classNames.split(/\s+/);
		for (var i = 0; i < classNames.length; i++) {
			var className = classNames[i];
			if (el.classList) {
				el.classList.remove(className);
			} else if (hasClass(el, className)) {
				el.className = el.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
			}
		}
	}

	function toggleClass(el, classNames, force) {
		classNames = classNames.split(/\s+/);
		for (var i = 0; i < classNames.length; i++) {
			var className = classNames[i];
			if (force === true) {
				addClass(el, className);
			} else if (force === false) {
				removeClass(el, className);
			} else {
				if (!hasClass(el, className)) {
					addClass(el, className);
				} else {
					removeClass(el, className);
				}
			}
		}
	}


	function getOffset(element) {
		var left = element.offsetLeft;
		var top = element.offsetTop;
		while (element = element.offsetParent) {
			left += element.offsetLeft + element.clientLeft - element.scrollLeft;
			top += element.offsetTop + element.clientTop - element.scrollTop;
		}
		return {
			left: left,
			top: top
		};
	}


	var Puzzle = function(place, imageURL, root, blankSlideIndex) {

		if (!(this instanceof Puzzle)) return new Puzzle(place, imageURL, root, blankSlideIndex);

		var that = this;
		this.hintShown = false;
		var container = this.container = document.createElement("div");
		container.className = Puzzle.classNames.CONTAINER;
		container.tabIndex = 0;
		var hiddenImage = this.hiddenImage = document.createElement("img");
		hiddenImage.className = Puzzle.classNames.HIDDEN_IMAGE;
		hiddenImage.src = this.imageURL = imageURL;
		container.appendChild(hiddenImage);
		var slideContainer = this.slideContainer = document.createElement("div");
		slideContainer.className = Puzzle.classNames.SLIDES;
		container.appendChild(slideContainer);
		var root = this.root = root || 4;
		var slideCount = Math.pow(root, 2);
		blankSlideIndex = typeof blankSlideIndex === "number" ? Math.max(Math.min(0, blankSlideIndex), slideCount - 1) : Math.floor(Math.random() * slideCount);
		var slides = this.slides = [];
		var orderedSlides = this.orderedSlides = [];
		for (var i = 0; i < slideCount; i++) {
			var x = (i + root) % root;
			var y = Math.floor(i / root);
			var slide = document.createElement("div");
			slide.className = Puzzle.classNames.SLIDE;
			/*slide.style.left = (x / root * 100) + "%";
			slide.style.top = (y / root * 100) + "%";*/
			slide.style.width = slide.style.height = (1 / root * 100) + "%";
			slide.style.backgroundImage = "url(" + imageURL + ")";
			slide.style.backgroundPosition = (x / (root - 1) * 100) + "%" + " " + (y / (root - 1) * 100) + "%";
			slide.style.backgroundSize = (root * 100) + "%" + " " + (root * 100) + "%";
			slide.style.backgroundRepeat = "no-repeat";
			this.moveSlideTo(slide, i);
			slideContainer.appendChild(slide);
			slides.push(slide);
			orderedSlides.push(slide);
		}
		var blankSlide = this.blankSlide = slides[blankSlideIndex];
		blankSlide.className += " " + Puzzle.classNames.BLANK_SLIDE;

		container.addEventListener("click", function(e) {
			if (that.hintShown) return;
			var slide = e.target;
			if (!slide || !hasClass(slide, Puzzle.classNames.SLIDE)) return;
			var slideIndex = that.getIndexFromSlide(slide);
			var blankSlideIndex = that.getIndexFromSlide(blankSlide);
			var posibility = slideIndex - blankSlideIndex;
			switch (posibility) {
				case -1:
					that.turnLeft();
					break;
				case -root:
					that.turnUp();
					break;
				case 1:
					that.turnRight();
					break;
				case root:
					that.turnDown();
					break;
			}
		});

		container.addEventListener("keydown", function(e) {
			if (that.hintShown) return;
			switch (e.keyCode) {
				case 37:
					that.turnLeft();
					e.preventDefault();
					break;
				case 38:
					that.turnUp();
					e.preventDefault();
					break;
				case 39:
					that.turnRight();
					e.preventDefault();
					break;
				case 40:
					that.turnDown();
					e.preventDefault();
					break;
				case 72:
					that.showHint();
					e.preventDefault();
					break;
				case 82:
					that.randomize();
					e.preventDefault();
					break;
			}
		});

		container.addEventListener("keyup", function(e) {
			switch (e.keyCode) {
				case 72:
					that.hideHint();
					e.preventDefault();
					break;
			}
		});

		blankSlide.addEventListener("touchmove", function(e) {
			if (that.hintShown) return;
			var slideContainer = that.slideContainer;
			var containerWidth = slideContainer.clientWidth;
			var containerHeight = slideContainer.clientHeight;
			var i = that.getIndexFromSlide(blankSlide);
			var slideX = ((i + root) % root) / root * containerWidth;
			var slideY = Math.floor(i / root) / root * containerHeight;
			var offset = getOffset(slideContainer);
			var x = e.touches[0].pageX - offset.left - slideX;
			var y = e.touches[0].pageY - offset.top - slideY;
			if (x < 0) {
				that.turnLeft();
			}
			if (y < 0) {
				that.turnUp();
			}
			if (x > containerWidth / root) {
				that.turnRight();
			}
			if (y > containerHeight / root) {
				that.turnDown();
			}
			e.preventDefault();
		});

		if (place) {
			if (place.appendChild) {
				place.appendChild(container);
			} else {
				place(container);
			}
		}

		/*var img = document.createElement("img");
		img.src = imageURL;
		document.body.appendChild(img);
		setTimeout(function() {
			console.log([img.width, img.height]);
		}, 1000);*/

		setTimeout(function() {
			that.randomize();
		}, 0);

	};

	Puzzle.prototype = {

		constructor: Puzzle,

		focus: function() {
			this.container.focus();
		},

		moveSlideTo: function(slide, i) {
			var root = this.root;
			var x = (i + root) % root;
			var y = Math.floor(i / root);
			slide.style.left = (x / root * 100) + "%";
			slide.style.top = (y / root * 100) + "%";
			toggleClass(slide, Puzzle.classNames.FIRST_COL, x == 0);
			toggleClass(slide, Puzzle.classNames.FIRST_ROW, y == 0);
			toggleClass(slide, Puzzle.classNames.LAST_COL, x == root - 1);
			toggleClass(slide, Puzzle.classNames.LAST_ROW, y == root - 1);
		},

		updateSlide: function(slide) {
			this.moveSlideTo(slide, this.getIndexFromSlide(slide));
		},

		updateSlides: function() {
			var slides = this.slides;
			for (var i = 0; i < slides.length; i++) {
				this.updateSlide(slides[i]);
			}
		},

		swapSlides: function(leftSlide, rightSlide) {
			var leftIndex = this.getIndexFromSlide(leftSlide);
			this.slides[this.getIndexFromSlide(rightSlide)] = leftSlide;
			this.slides[leftIndex] = rightSlide;
			this.updateSlide(leftSlide);
			this.updateSlide(rightSlide);
			this.checkIfSolved();
		},

		getIndexFromSlide: function(slide) {
			var slides = this.slides;
			for (var i = 0; i < slides.length; i++) {
				var s = slides[i];
				if (s === slide) return i;
			}
			return -1;
		},

		showHint: function() {
			if (this.hintShown) return;
			if (!this.triggerEvent("showhint", {
				instance: this
			})) {
				return;
			}
			this.hintShown = true;
			addClass(this.container, Puzzle.classNames.HINT_SHOWN);
			for (var i = 0; i < this.orderedSlides.length; i++) {
				var orderedSlide = this.orderedSlides[i];
				if (orderedSlide !== this.slides[i]) {
					this.moveSlideTo(orderedSlide, i);
				}
			}
		},

		hideHint: function() {
			if (!this.hintShown) return;
			if (!this.triggerEvent("hidehint", {
				instance: this
			})) {
				return;
			}
			this.hintShown = false;
			removeClass(this.container, Puzzle.classNames.HINT_SHOWN);
			for (var i = 0; i < this.slides.length; i++) {
				var slide = this.slides[i];
				if (slide !== this.orderedSlides[i]) {
					this.moveSlideTo(slide, i);
				}
			}
		},

		getTurnPosibilities: function() {
			var root = this.root;
			var blankSlideIndex = this.getIndexFromSlide(this.blankSlide);
			return {
				left: (((blankSlideIndex - 1) + 1) % root != 0) && (blankSlideIndex - 1 >= 0),
				up: blankSlideIndex - root >= 0,
				right: ((blankSlideIndex + 1) % root != 0) && (blankSlideIndex + 1 <= Math.pow(root, 2) - 1),
				down: blankSlideIndex + root <= Math.pow(root, 2) - 1
			};
		},

		turnLeft: function() {
			var slideIndex = this.getIndexFromSlide(this.blankSlide) - 1;
			if (!!((slideIndex + 1) % this.root) && (slideIndex >= 0)) {
				if (this.triggerEvent("beforeturn", {
						instance: this,
						direction: "left"
					})) {
					this.swapSlides(this.blankSlide, this.slides[slideIndex]);
					this.triggerEvent("turn", {
						instance: this,
						direction: "left"
					});
				}
			}
		},

		turnUp: function() {
			var slideIndex = this.getIndexFromSlide(this.blankSlide) - this.root;
			if (slideIndex >= 0) {
				if (this.triggerEvent("beforeturn", {
						instance: this,
						direction: "up"
					})) {
					this.swapSlides(this.blankSlide, this.slides[slideIndex]);
					this.triggerEvent("turn", {
						instance: this,
						direction: "up"
					});
				}
			}
		},

		turnRight: function() {
			var slideIndex = this.getIndexFromSlide(this.blankSlide) + 1;
			if (!!(slideIndex % this.root) && (slideIndex <= Math.pow(this.root, 2) - 1)) {
				if (this.triggerEvent("beforeturn", {
						instance: this,
						direction: "right"
					})) {
					this.swapSlides(this.blankSlide, this.slides[slideIndex]);
					this.triggerEvent("turn", {
						instance: this,
						direction: "right"
					});
				}
			}
		},

		turnDown: function() {
			var slideIndex = this.getIndexFromSlide(this.blankSlide) + this.root;
			if (slideIndex <= Math.pow(this.root, 2) - 1) {
				if (this.triggerEvent("beforeturn", {
						instance: this,
						direction: "down"
					})) {
					this.swapSlides(this.blankSlide, this.slides[slideIndex]);
					this.triggerEvent("turn", {
						instance: this,
						direction: "down"
					});
				}
			}
		},

		randomize: function(steps) {
			if (this.hintShown) return;
			var root = this.root;
			steps = typeof steps === "number" ? steps : root * 50;
			if (!this.triggerEvent("beforerandomize", {
					instance: this,
					steps: steps
				})) {
				return;
			}
			while (steps--) {
				var possibilities = this.getTurnPosibilities();
				var moves = [];
				var directions = ["left", "up", "right", "down"];
				for (var i = 0; i < directions.length; i++) {
					var direction = directions[i];
					if (possibilities[direction]) {
						moves.push(direction);
					}
				}
				var move = moves[Math.floor(Math.random() * moves.length)];
				var offset;
				switch (move) {
					case "left":
						offset = -1;
						break;
					case "up":
						offset = -root;
						break;
					case "right":
						offset = 1;
						break;
					case "down":
						offset = root;
						break;
				}
				this.swapSlides(this.blankSlide, this.slides[this.getIndexFromSlide(this.blankSlide) + offset]);
			}
			this.triggerEvent("randomize", {
				instance: this,
				steps: steps
			});
		},

		checkIfSolved: function() {
			for (var i = 0; i < this.orderedSlides.length; i++) {
				if (this.orderedSlides[i] !== this.slides[i]) {
					removeClass(this.container, Puzzle.classNames.SOLVED);
					return;
				}
			}
			addClass(this.container, Puzzle.classNames.SOLVED);
			this.triggerEvent("solve");
		},

		solve: function() {
			if (this.hintShown) return;
			var orderedSlides = this.orderedSlides;
			var slides = this.slides;
			for (var i = 0; i < orderedSlides.length; i++) {
				var orderedSlide = orderedSlides[i];
				var slide = slides[i];
				if (orderedSlide !== slide) {
					this.swapSlides(orderedSlide, slide);
				}
			}
		},

		addEventListener: function(type, handler) {
			this.container.addEventListener(type, handler, false);
		},

		removeEventListener: function(type, handler) {
			this.container.removeEventListener(type, handler, false);
		},

		triggerEvent: function(type, overrides) {
			var event = document.createEvent("Event");
			event.initEvent(type, true, true);
			if (typeof overrides === "object") {
				for (var i in overrides) {
					event[i] = overrides[i];
				}
			}
			return this.container.dispatchEvent(event);
		}

	};

	Puzzle.classNames = {

		CONTAINER: "Puzzle",
		HINT_SHOWN: "Puzzle-hint-shown",
		SOLVED: "Puzzle-solved",
		HIDDEN_IMAGE: "Puzzle-hidden-image",
		SLIDES: "Puzzle-slides",
		SLIDE: "Puzzle-slide",
		BLANK_SLIDE: "Puzzle-blank-slide",
		FIRST_COL: "Puzzle-first-col",
		FIRST_ROW: "Puzzle-first-row",
		LAST_COL: "Puzzle-last-col",
		LAST_ROW: "Puzzle-last-row"

	};

	window.Puzzle = Puzzle;


})();