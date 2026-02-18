const mapObject = document.getElementById("map");

mapObject.addEventListener("load", () => {
    const svgDoc = mapObject.contentDocument;
    const viewport = svgDoc.getElementById("viewport");
    const svg = svgDoc.querySelector("svg");
    const bbox = viewport.getBBox();
    
    let isDragging = false;
    let scale = 1.5;

    let translateX = 0.25 * (svg.clientWidth - bbox.width * scale);
    let translateY = 0.25 * (svg.clientHeight - bbox.height * scale);
   
    updateTransform();



    // region data
    const regionData = {
        KENSHINGTON: {
            name: "KENSHINGTON",
            slides: [
                "heartwood.png",
                "heartwood.png",
                "heartwood.png"
            ]
        },
        ASHFORD: {
            name: "ASHFORD",
            slides: [
                "ashford1.png",
                "ashford2.png",
                "ashford3.png"
            ]
        },
        ASHFORD_DRIVE_UNDER: {
            name: "ASHFORD_DRIVE_UNDER",
            slides: [
                "basketball.jpg",
                "construction.WEBP",
                "logo.png"
            ]
        },
        CYPRESS: {
            name: "CYPRESS",
            slides: [
                "basketball.jpg",
                "construction.WEBP",
                "logo.png"
            ]
        },
        PALMETTO: {
            name: "PALMETTO",
            slides: [
                "basketball.jpg",
                "construction.WEBP",
                "logo.png"
            ]
        }

    };
  

    const cursorLabel = document.getElementById("cursor-label");
    // hover over cursor label unit
    Object.values(regionData).forEach(data => {
        const region = svgDoc.getElementById(data.name);
        if (!region) return;

        region.addEventListener("pointerenter", (e) => {
            const data = regionData[region.id];
            if (!data) return;

            cursorLabel.style.display = "block";
            cursorLabel.textContent = data.name;
        });

        region.addEventListener("pointermove", (e) => {
            const rect = mapObject.getBoundingClientRect();

            cursorLabel.style.left = rect.left + e.offsetX + "px";
            cursorLabel.style.top = rect.top + e.offsetY - 25 + "px";
        });


        region.addEventListener("pointerleave", () => {
            cursorLabel.style.display = "none";
        });
        region.addEventListener("pointerup", () => {
            const data = regionData[region.id];
            if (!data) return;

            openPanel(data.slides);
        });

    });


    const panel = document.getElementById("house-panel");
    const slideImg = document.getElementById("slide-image");
    const prevSlide = document.getElementById("slide-prev");
    const nextSlide = document.getElementById("slide-next");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const closeBtn = document.getElementById("close-panel");

    let currentSlides = [];
    let currentIndex = 0;
    let isAnimating = false;


    function openPanel(slides) {
        currentSlides = slides;
        // start at the second slide if there are multiple slides, otherwise start at the first slide   
        currentIndex = currentSlides.length > 1 ? 1 : 0;
        prevSlide.src = currentSlides[(currentIndex - 1 + currentSlides.length) % currentSlides.length];
        nextSlide.src = currentSlides[(currentIndex + 1) % currentSlides.length];
        slideImg.src = currentSlides[currentIndex];
        panel.classList.add("active");
    }
    function showNext() {
        currentIndex = (currentIndex + 1) % currentSlides.length;
        prevSlide.src = currentSlides[(currentIndex - 1 + currentSlides.length) % currentSlides.length];
        slideImg.src = currentSlides[currentIndex];
        nextSlide.src = currentSlides[(currentIndex + 1) % currentSlides.length];
        // add animation classes
        // slideImg.classList.add("slide-in-right");
        // prevSlide.classList.add("slide-in-left");
        // nextSlide.classList.add("slide-in-right");
    }

    // function showNext() {
    //     // Remove previous animation classes
    //     slideImg.classList.remove("slide-in-right", "slide-in-left");
    //     prevSlide.classList.remove("slide-in-right", "slide-in-left");
    //     nextSlide.classList.remove("slide-in-right", "slide-in-left");

    //     // Force reflow so animation can restart
    //     void slideImg.offsetWidth;

    //     // Add animation classes
    //     slideImg.classList.add("slide-in-left");
    //     nextSlide.classList.add("slide-in-left");
    //     prevSlide.classList.add("slide-in-left");

    //     setTimeout(() => {
    //         currentIndex = (currentIndex + 1) % currentSlides.length;

    //         prevSlide.src = currentSlides[(currentIndex - 1 + currentSlides.length) % currentSlides.length];
    //         slideImg.src = currentSlides[currentIndex];
    //         nextSlide.src = currentSlides[(currentIndex + 1) % currentSlides.length];

    //         slideImg.classList.remove("slide-in-left");
    //         prevSlide.classList.remove("slide-in-left");
    //         nextSlide.classList.remove("slide-in-left");
    //     }, 500);
    // }



    function showPrev() {
        currentIndex = (currentIndex - 1 + currentSlides.length) % currentSlides.length;
        prevSlide.src = currentSlides[(currentIndex - 1 + currentSlides.length) % currentSlides.length];
        nextSlide.src = currentSlides[(currentIndex + 1) % currentSlides.length];
        slideImg.src = currentSlides[currentIndex];
    }
    function closePanel() {
        panel.classList.remove("active");
    }

    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);
    closeBtn.addEventListener("click", closePanel);





    // zoom in zoom out and pan functionality
    svg.style.touchAction = "none";
    svg.addEventListener("dragstart", (e) => e.preventDefault());
    svg.addEventListener("pointerdown", (e) => {
        console.log("Pointer down on SVG");
        if (e.target.closest(".cursor-label")) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        translateX += 2*dx;
        translateY += 2*dy;

        startX = e.clientX;
        startY = e.clientY;

        updateTransform();
    });
    svg.addEventListener("pointerup", (e) => {
        isDragging = false;
        svg.releasePointerCapture(e.pointerId);
    });
    svg.addEventListener("pointercancel", () => {
        isDragging = false;
    });
    svg.addEventListener("wheel", (e) => {
        e.preventDefault();

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;

        const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());

        const worldX = (cursor.x - translateX) / scale;
        const worldY = (cursor.y - translateY) / scale;

        const zoomFactor = Math.exp(-e.deltaY * 0.0015);
        const minScale = 1.5;
        const newScale = Math.min(Math.max(minScale, scale * zoomFactor), 5);

        translateX = cursor.x - worldX * newScale;
        translateY = cursor.y - worldY * newScale;

        scale = newScale;

        updateTransform();
    }, { passive: false });
    function updateTransform() {
        viewport.setAttribute(
            "transform",
            `translate(${translateX}, ${translateY}) scale(${scale})`
        );
    }


    // search functionality
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim().toLowerCase();
        console.log("Searching for:", query);
        if (!query) return;
        const svgDoc = mapObject.contentDocument;
        const regions = svgDoc.querySelectorAll(".cursor-label");
        let found = false;
        regions.forEach(region => {
            // getAttribute returns null if it's missing. 
            // The "?? ''" part turns null into an empty string so .toLowerCase() works.
            const idName = (region.getAttribute("id") ?? "").toLowerCase();
            const labelName = (region.getAttribute("inkscape:label") ?? "").toLowerCase();

            console.log("Checking:", idName);

            if (idName.includes(query) || labelName.includes(query)) {
                region.classList.add("search-highlight");
                found = true;
                region.addEventListener("animationend", () => {
                    region.classList.remove("search-highlight");
                });
            } 
        });

        if (!found) {
            alert("No matching region found.");
        }
    });

    // function to add points to the map
    function addPoint(x, y, label, id) {
        const ns = "http://www.w3.org/2000/svg";

        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 20);
        circle.setAttribute("class", "cursor-label point");
        circle.setAttribute("inkscape:label", label);
        circle.setAttribute("id", id);

        viewport.appendChild(circle);
    }

    

});
