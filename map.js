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

    addPoint(1000, 1200, "New Construction Site", "newsite");
    addPoint(1500, 800, "New Construction Site", "newsite");


    const tooltip = document.getElementById("tooltip");
    const tooltipImg = document.getElementById("tooltip-img");
    const tooltipText = document.getElementById("tooltip-text");
    const regionDataphase = {
        KENSHINGTON: {
            name: "KENSHINGTON"
        }
    };
    const regionData = {
        highlight1: {
            title: "Residence Zone",
            image: "residence.WEBP",
            description: "Main manufacturing zone.",
            link: "more.html"
        },
        grass: {
            title: "Green Space",
            image: "basketball.jpg",
            description: "I think y'all should put a basketball court here.",
            link: "more.html"
        },
        newsite: {
            title: "New Construction Site",
            image: "construction.WEBP",
            description: "Under construction.",
            link: "more.html"
        }


    };

    const regions = svgDoc.querySelectorAll(".hover-target");

    regions.forEach(region => {
        region.addEventListener("pointerup", () => {
            console.log("Region clicked:", region.id);
            const id = region.id;
            const data = regionData[id];
            if (!data || !data.link) return;
            console.log("Navigating to:", data.link);
            window.open(data.link, "_blank"); 
            // or use: window.location.href = data.link;
        });
        region.addEventListener("pointerenter", (e) => {
            // console.log("Region hovered:", region.id);
            const id = region.id;
            const data = regionData[id];
            if (!data) return;

            tooltip.style.display = "block";
            tooltipImg.src = data.image;
            tooltipText.innerHTML = `
                <strong>${data.title}</strong><br>
                ${data.description}<br>
            `;
        });

        region.addEventListener("pointermove", (e) => {
            tooltip.style.left = e.clientX + 15 + "px";
            tooltip.style.top = e.clientY + 15 + "px";
        });

        region.addEventListener("pointerleave", () => {
            tooltip.style.display = "none";
        });

        
    });


    const regionsphaseone = svgDoc.querySelectorAll(".hover-target-phase-one");

    regionsphaseone.forEach(phaseone => {
    //     phaseone.addEventListener("pointerup", () => {
    //         console.log("Region clicked:", phaseone.id);
    //         const id = phaseone.id;
    //         const data = regionDataphase[id];
    //         if (!data || !data.link) return;
    //         // window.open(data.link, "_blank"); 
    //     });

        phaseone.addEventListener("pointerenter", (e) => {
            console.log("Region hovered:", phaseone.id);
            const id = phaseone.id;
            const data = regionDataphase[id];
            if (!data) return;
            // console.log("Displaying tooltip for:", data.name);

            tooltip.style.display = "block";
            tooltipText.innerHTML = `
                <strong>${data.name}</strong><br>
            `;
        });
        phaseone.addEventListener("pointermove", (e) => {
            tooltip.style.left = e.clientX + "px";
            tooltip.style.top = e.clientY + 15 + "px";
        });

        // ADD THIS: Hides the tooltip when leaving
        phaseone.addEventListener("pointerleave", () => {
            tooltip.style.display = "none";
        });
    })

    



    svg.style.touchAction = "none";

    svg.addEventListener("dragstart", (e) => e.preventDefault());

    svg.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".hover-target")) return;
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
        // document.getElementById("d-scale").innerText = scale.toFixed(4);
        // document.getElementById("d-x").innerText = translateX.toFixed(2);
        // document.getElementById("d-y").innerText = translateY.toFixed(2);
        viewport.setAttribute(
            "transform",
            `translate(${translateX}, ${translateY}) scale(${scale})`
        );
    }

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim().toLowerCase();
        console.log("Searching for:", query);
        if (!query) return;
        const svgDoc = mapObject.contentDocument;
        const regions = svgDoc.querySelectorAll(".hover-target");
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

    function addPoint(x, y, label, id) {
        const ns = "http://www.w3.org/2000/svg";

        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 20);
        circle.setAttribute("class", "hover-target point");
        circle.setAttribute("inkscape:label", label);
        circle.setAttribute("id", id);

        viewport.appendChild(circle);
    }

    

});
