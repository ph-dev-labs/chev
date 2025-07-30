"use strict";
(function (w, d, $) {
    //force scroll to top on unload do to animation issues. If the page loads in the middle of an animation it causes them to load incorrectly
    //window.onbeforeunload = function () {
        //$("body").hide();
        //window.scrollTo(0, 0);
    //};
    //Set the scrollmagic controller
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    //setting various heigts and widths used throughout the script. We need to rethink how these are initialized and re-initialized specifically on resize.
    let $shipContainer = $("#ship-container"),
        $shipLarge = $("#ship"),
        $portContainer = $("#port-container"),
        $shipSmall = $("#ship-small"),
        $port = $("#port"),
        $sideShipPin = $("#side-ship-pin"),
        $sideCloud = $("#side-cloud"),
        $sideShipPanels = $("#side-ship-panels"),
        windowHeight,
        windowWidth,
        cloudDuration,
        shipSmallConstantHeight = 536,
        shipLargeHeight,
        shipLargeOffset,
        sideCloudHeight,
        sideShipPinHeight,
        sideShipOffset,
        sideShipConstantHeight = 427,
        sideShipPinConstantOffset = 0,
        sideShipTallScreenOffset = 0,
        sideShipWindowSplitRatio,
        sideShipHeightAdjusted,
        sideShipPanelHeightAdjusted,
        sideShipPanelImageHeightAdjusted,
        sideShipPanelTextHeightAdjusted,
        sideShipPanelsHeight,
        sideShipTranslate1,
        sideShipTranslate2,
        sideShipTranslate3,
        portHeight,
        portCenterConstantHeight = 475,
        portHeightOffset = 0;


     /*NOSONAR 
     const outputVars = function (message) {       
        console.log("start:" + message);
        console.log("shipLargeHeight: " + shipLargeHeight);
        console.log("shipLargeOffset: " + shipLargeOffset);
        console.log("$eiffel.height(): " + $eiffel.height());
        console.log("eiffelMobileOffset:" + eiffelMobileOffset);
        console.log("$('#eiffel-mobile  .bottom-row').height():" + $("#eiffel-mobile  .bottom-row").height());
        console.log("sideCloudHeight: " + sideCloudHeight);
        console.log("sideShipWindowSplitRatio: " + sideShipWindowSplitRatio);
        console.log("sideShipPanelHeightAdjustment: " + sideShipPanelHeightAdjusted);
        console.log("sideShipPanelImageHeightAdjustment: " + sideShipPanelImageHeightAdjusted);
        console.log("sideShipPanelTextHeightAdjustment: " + sideShipPanelTextHeightAdjusted);
        console.log("sideWidthAdjust: " + sideShipHeightAdjusted * 2000 / sideShipConstantHeight);
        console.log("sideShipHeightAdjustment: " + sideShipHeightAdjusted);
        console.log("sideShipTranslate1: " + sideShipTranslate1);
        console.log("sideShipTranslate2: " + sideShipTranslate2);
        console.log("sideShipTranslate3: " + sideShipTranslate3);
        console.log("portHeight: " + portHeight);
        console.log("portHeightOffset: " + portHeightOffset);
        console.log("windowHeight: " + windowHeight);
        console.log("windowWidth: " + windowWidth);
        console.log("end:" + message);       
    };*/

    const resetScenesAndTweens = function () {
        ScrollTrigger.refresh(true);
    };
    //Used to set min-heights and paddings
    const initializeSideShipContainers = function () {
        sideShipPinHeight = $sideShipPin.height();
        sideShipWindowSplitRatio = 0.5;
        sideShipHeightAdjusted = windowHeight * sideShipWindowSplitRatio;
        sideShipPanelHeightAdjusted = Math.round(windowHeight * (1 - sideShipWindowSplitRatio) - 50);
        sideShipPanelImageHeightAdjusted = sideShipPanelHeightAdjusted;
        sideShipPanelTextHeightAdjusted = sideShipPanelHeightAdjusted;
        sideShipOffset = Math.round((sideShipConstantHeight - 350) * sideShipHeightAdjusted / sideShipConstantHeight);
        sideCloudHeight = Math.round($sideCloud.height());
        sideShipPanelsHeight = Math.round($sideShipPanels.height());

        //Desktop Panel Height is 400 max
        if (sideShipPanelHeightAdjusted > 400) {
            sideShipPanelHeightAdjusted = 400;
            sideShipPanelImageHeightAdjusted = sideShipPanelHeightAdjusted;
            sideShipPanelTextHeightAdjusted = sideShipPanelHeightAdjusted;
        }

        if (windowWidth <= 991) {
            sideShipWindowSplitRatio = 0.3;
            sideShipHeightAdjusted = Math.round(windowHeight * sideShipWindowSplitRatio);
            sideShipPanelHeightAdjusted = Math.round(windowHeight * (1 - sideShipWindowSplitRatio) - 35);
            sideShipPanelImageHeightAdjusted = Math.round(sideShipPanelHeightAdjusted * 0.6);
            sideShipPanelTextHeightAdjusted = sideShipPanelHeightAdjusted - sideShipPanelImageHeightAdjusted;
            sideShipOffset = Math.round((sideShipConstantHeight - 350) * sideShipHeightAdjusted / sideShipConstantHeight);
        }

        if (windowWidth <= 767) {
            sideShipPanelImageHeightAdjusted = Math.round(sideShipPanelHeightAdjusted * 0.4);
            sideShipPanelTextHeightAdjusted = sideShipPanelHeightAdjusted - sideShipPanelImageHeightAdjusted;
        }

        if (sideShipHeightAdjusted > sideShipConstantHeight) {
            sideShipHeightAdjusted = sideShipConstantHeight;
            sideShipOffset = Math.round((sideShipConstantHeight - 350) * sideShipHeightAdjusted / sideShipConstantHeight);
        }

        sideShipTranslate1 = windowWidth / 2;
        sideShipTranslate2 = -(sideShipHeightAdjusted * 2000 / sideShipConstantHeight) + sideShipTranslate1 + windowWidth * 0.2;
        sideShipTranslate3 = sideShipTranslate2 - windowWidth * 0.1;

        //set offset of pin location for tall windows to show text above side ship
        if (sideShipHeightAdjusted === sideShipConstantHeight && sideShipPanelHeightAdjusted === 400 && windowHeight >= 1080) {
            sideShipTallScreenOffset = Math.round(windowHeight - sideShipHeightAdjusted - sideShipPanelHeightAdjusted - 50);
        } else {
            sideShipTallScreenOffset = 0;
        }

        $sideShipPin.css({
            "min-height": -sideShipHeightAdjusted + "px",
            "margin-bottom": -sideShipHeightAdjusted + "px"
        });
        $sideShipPanels.css({
            "top": -sideShipHeightAdjusted + sideShipOffset + "px",
            "margin-top": sideShipHeightAdjusted - sideShipOffset + "px"
        });
        $("#side-ship").css({
            "top": -sideShipHeightAdjusted + sideShipOffset + "px",
            "margin-bottom": -sideShipHeightAdjusted + sideShipOffset + "px",
            "width": sideShipHeightAdjusted * 2000 / sideShipConstantHeight + "px",
            "height": sideShipHeightAdjusted + "px"
        })
            .next(".panels-container").css("height", sideShipPanelHeightAdjusted + "px")
            .find(".slide .image-container").css("height", sideShipPanelImageHeightAdjusted + "px")
            .next(".text-container").css("height", sideShipPanelTextHeightAdjusted + "px");

        if ((sideCloudHeight + sideShipPanelsHeight) > sideShipPinHeight) {
            sideShipPinHeight = sideCloudHeight + sideShipPanelsHeight;
            $sideShipPin.css("min-height", sideShipPinHeight).parent().css("min-height", sideShipPinHeight);
        }
    };

    const initializeContainers = function () {
        shipLargeHeight = $shipLarge.height();
        shipLargeOffset = shipLargeHeight + (windowHeight - shipSmallConstantHeight) / 2;
        cloudDuration = shipLargeHeight + shipLargeOffset;

        //Initial settings of eiffel and port scenes dynamic attributes.
        $("#cards .card").css({
            // shipLargeHeight * 2 goes all the way to bottom, so using 1.75
            "margin-top": ((shipLargeHeight * 1.30) - ($("#cards .card").height() * 3)) / 3 + "px"
        });

        //set sideShip containers
        initializeSideShipContainers();

        $shipContainer.css({
            "min-height": shipLargeHeight + "px",
            "margin-bottom": -shipLargeHeight + windowHeight * .5 + "px"
        });

        if (windowHeight <= 560) {
            $("#eiffel-mobile .bottom-row .col").css("height", windowHeight - 30 + "px");
            $("#ship-image-mobile-small, #eiffel-mobile .left .line, #eiffel-mobile .right .line").css("max-height", windowHeight - 60 + "px");
            $("#eiffel-mobile .eiffel-container img").css("max-height", windowHeight * 489 / 536 - 60 + "px");
        } else {
            $("#eiffel-mobile .bottom-row .col").css("height", "");
            $("#ship-image-mobile-small, #eiffel-mobile .left .line").css("max-height","");
            $("#eiffel-mobile .right .line, #eiffel-mobile .eiffel-container img").css("max-height", "");
        }

        if (windowWidth <= 991) {
            //mobile scenes do not need the extra negative margin
            $shipContainer.css({
                "margin-bottom": -shipLargeHeight + "px"
            });
        }
        portHeight = $port.height();
        //set offset if window is taller than top of port
        if (windowHeight / 2 > portCenterConstantHeight) {
            //20px added to fix ipad url/favorites bar bug
            portHeightOffset = windowHeight / 2 - portCenterConstantHeight + 20;
        }

        $portContainer.css("min-height", portHeight + portHeightOffset + "px");
        $shipSmall.css("padding-bottom", portHeight + portHeightOffset + "px");
    };

    function textAnimateScenes(item, index) {
        let end = "50%",
            start = "50%"
        if (item.dataset.sceneDuration) {
            end = item.dataset.sceneDuration;
        }
        if (item.dataset.sceneTriggerHook) {
            start = `${item.dataset.sceneTriggerHook * 100}%`
        }
        const textAnimateTl = gsap.timeline({
            scrollTrigger: {
                id: `textAnimate${index}`,
                trigger: item,
                start: `top ${start}`,
                end: `+=${end}`,
                scrub: 1,
                markers: false
            }
        });
        textAnimateTl.to(item.querySelectorAll(".text-animate"),
            { opacity: 1, ease: Circ.easeInOut, duration: 1.25 }
        );
    }

    function panelAnimateScenes(item, index) {
        const panelAnimateTl = gsap.timeline({
            scrollTrigger: {
                id: `panel${index}`,
                trigger: item,
                start: "top 75%",
                markers: false
            }
        });
        panelAnimateTl
            .to(item, { y: "0", ease: Circ.easeOut, duration: 1 }, 0)
            .to(item.querySelector(".vertical-middle"), { opacity: 1, ease: Circ.easeOut, duration: 1 }, 0)
            .to(item.querySelector(".vertical-middle p"), { y: "0", ease: Circ.easeOut, duration: 1.25 }, 0);
    }

    function targetBounce(targetNumber) {
        //set target to 0 to clear active class
        if (targetNumber !== 0) {
            $("#side-ship .ship-target").attr("class", "ship-target");
            $("#ship-target-" + targetNumber).attr("class", "ship-target active");
        } else {
            $("#side-ship .ship-target").attr("class", "ship-target");
        }
    }

    const initializeDynamicTweens = function () {
        const mm = gsap.matchMedia();
        mm.add({
            isDesktop: "(min-width: 992px)",
            isTabletOrMobile: "(max-width: 991.99px)"
        }, (context) => {
            const { isDesktop } = context.conditions;
            ScrollTrigger.defaults({
                toggleActions: "play complete none reset",
                invalidateOnRefresh: true,
                anticipatePin: 1,
                markers: {
                    startColor: "yellow",
                    endColor: "red",
                    fontSize: "18px",
                    fontWeight: "bold",
                    indent: 0
                }
            });

            textAnimateScenes(d.querySelector("#text-1"), "text-1");

            //Pins cloud scene.
            ScrollTrigger.create({
                id: "cloudsPinScene",
                trigger: "#clouds-container",
                pin: "#clouds-container",
                start: "top top",
                end: cloudDuration,
                markers: false
            });

            //ship translate scene shipLargeTranslateScene =
            gsap.timeline({
                scrollTrigger: {
                    id: "shipLargeTranslateScene",
                    trigger: "#ship-container",
                    start: "top bottom",
                    end: shipLargeHeight * 2,
                    scrub: 1,
                    onLeave: function () {
                        ocean.setScrollSpeed(0);
                    },
                    markers: false
                }
            }).to("#ship-image", { y: -shipLargeOffset, ease: Linear.easeNone });

            //pins large ship ship shipLargePinScene = 
            ScrollTrigger.create({
                id: "shipLargePinScene",
                trigger: "#ship-container",
                pin: "#ship-container",
                start: "top bottom",
                end: isDesktop ? (shipLargeHeight * 2 + windowHeight * 3.5) : (shipLargeHeight * 2),
                onEnter: function () {
                    ocean.enterLargePhase();
                },
                onLeave: function () {
                    ocean.setScrollSpeed(-0.2);
                },
                onLeaveBack: function () {
                    ocean.setScrollSpeed(0.2);
                },
                markers: false
            });

            //scales ship to small size
            if (isDesktop) {
               const shipLargeScalelTl = gsap.timeline({
                   scrollTrigger: {
                        id: "shipLargeScalelTl",
                        trigger: "#ship-image",
                        start: `top+=${shipLargeHeight * 2}px bottom`,
                        end: "+=200%",
                        scrub:1,
                        onUpdate: function (progress) {
                            ocean.zoomProgress(progress);
                        },
                        onEnter: function () {
                            ocean.enterZoom();
                            ocean.setScrollSpeed(0);
                        },
                        onLeave: function () {
                            ocean.exitZoom();
                        },
                        markers: false
                    }
                });
                shipLargeScalelTl.to("#ship-image", {
                    scale: shipSmallConstantHeight / shipLargeHeight,
                    transformOrigin: "center bottom",
                    ease: Linear.easeInOut1
                });

                //animates eiffel scene up after scale complete      
                const eiffel1Tl = gsap.timeline({
                    scrollTrigger: {
                        id: "eiffel1TL",
                        trigger: "#ship-image",
                        toggleActions: "play complete none reverse",
                        start: `top+=${shipLargeHeight * 2 + windowHeight}px bottom`,
                        end: "+=100%",
                        toggleClass: {
                            targets: "#ship",
                            className: "show"
                        },
                        markers: false
                    }
                });
                eiffel1Tl.to("#eiffel", {
                    y: -shipLargeOffset,
                    ease: Circ.easeInOut
                });

                const eiffel2Tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#ship-image",
                        start: `top+=${shipLargeHeight * 2 + windowHeight * 1.25}px top`,
                        scrub: 1,
                        markers: false
                    }
                });
                eiffel2Tl.add(gsap.to("#eiffel .line-ship-bottom-1", { attr: { d: "M 5 535 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                    .add(gsap.to("#eiffel .line-ship-bottom-2", { attr: { d: "M 5 535 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                    .add(gsap.to("#eiffel .line-tower-bottom-1", { attr: { d: "M 5 535 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                    .add(gsap.to("#eiffel .line-tower-bottom-2", { attr: { d: "M 5 535 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                    .add(gsap.to("#eiffel .line-ship-vertical", { attr: { d: "M 5 536 V 0" }, ease: Circ.easeInOut, duration: 0.5 }), 0.25)
                    .add(gsap.to("#eiffel .line-tower-vertical", { attr: { d: "M 5 536 V 48" }, ease: Circ.easeInOut, duration: 0.5 }), 0.25)
                    .add(gsap.to("#eiffel .line-ship-top-1", { attr: { d: "M 5 1 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                    .add(gsap.to("#eiffel .line-ship-top-2", { attr: { d: "M 5 1 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                    .add(gsap.to("#eiffel .line-tower-top-1", { attr: { d: "M 5 49 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                    .add(gsap.to("#eiffel .line-tower-top-2", { attr: { d: "M 5 49 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                    .add(gsap.to("#eiffel .svg-text", { opacity: 1, ease: Circ.easeNone, duration: 0.25 }), 0.75);
            } else {
                //animates the lines in eiffel scene
                ScrollTrigger.create({
                    id: "eiffelMobilePinScene",
                    trigger: "#eiffel-mobile .bottom-row",
                    pin: "#eiffel-mobile",
                    start: "center center",
                    end: "+=50%",
                    markers: false
                });
                const eiffelMobile2Tl = gsap.timeline({
                    scrollTrigger: {
                        id: "eiffelMobile2Tl",
                        toggleActions: "play complete none reverse",
                        trigger: "#eiffel-mobile .bottom-row",
                        start: "center center",
                        markers: false
                    }
                });
                eiffelMobile2Tl.add(gsap.to("#eiffel-mobile .line-ship-bottom-1", { attr: { d: "M 5 535 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                     .add(gsap.to("#eiffel-mobile .line-ship-bottom-2", { attr: { d: "M 5 535 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                     .add(gsap.to("#eiffel-mobile .line-tower-bottom-1", { attr: { d: "M 5 535 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                     .add(gsap.to("#eiffel-mobile .line-tower-bottom-2", { attr: { d: "M 5 535 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0)
                     .add(gsap.to("#eiffel-mobile .line-ship-vertical", { attr: { d: "M 5 536 V 0" }, ease: Circ.easeInOut, duration: 0.5 }), 0.25)
                     .add(gsap.to("#eiffel-mobile .line-tower-vertical", { attr: { d: "M 5 536 V 48" }, ease: Circ.easeInOut, duration: 0.5 }), 0.25)
                     .add(gsap.to("#eiffel-mobile .line-ship-top-1", { attr: { d: "M 5 1 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                     .add(gsap.to("#eiffel-mobile .line-ship-top-2", { attr: { d: "M 5 1 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                     .add(gsap.to("#eiffel-mobile .line-tower-top-1", { attr: { d: "M 5 49 H 0" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                     .add(gsap.to("#eiffel-mobile .line-tower-top-2", { attr: { d: "M 5 49 H 10" }, ease: Circ.easeInOut, duration: 0.25 }), 0.75)
                     .add(gsap.to("#eiffel-mobile .svg-text", { opacity: 1, ease: Circ.easeNone, duration: 0.25 }), 0.75);

                ScrollTrigger.create({
                    id: "eiffelMobileScene",
                    trigger: "#eiffel-mobile",
                    start: "top 50%",
                    end: "+=300%",
                    onEnter: function () {
                        ocean.enterSmallPhase();
                    },
                    onLeave: function () {
                        ocean.exitSmallPhase();
                    },
                    markers: false
                });
            }

            //Animates the side cloud scene
            const sideCloudTl = gsap.timeline({
                scrollTrigger: {
                    id: "sideCloudShowText",
                    trigger: "#side-ship-pin",
                    start: "top 35%",
                    markers: false
                }
            });            
            sideCloudTl.to("#side-cloud > .section",
                {
                    opacity: 1,
                    ease: Circ.easeNone,
                    duration: 1,
                    delay: 0.25
                }
            );

            //Initial Animation in side ship scene
            ScrollTrigger.create({
                id: "sideShipPanelsPin",
                trigger: "#side-ship-pin",
                pin: "#side-ship-pin",
                start: `top+=${sideCloudHeight - sideShipHeightAdjusted + sideShipOffset - sideShipPinConstantOffset - sideShipTallScreenOffset}px top`,
                end: "+=350%",
                scrub: 1,
                onEnter: function () {
                    ocean.setScrollSpeed(0);
                },
                onLeave: () => {
                    ocean.setScrollSpeed(-0.2);
                    $("#ship-image").show();
                },
                onLeaveBack: () => { ocean.setScrollSpeed(0.2); },
                markers: false
            });

            const sideShip1Tl = gsap.timeline({
                scrollTrigger: {
                    id: "sideShipSlideIn",
                    trigger: "#side-ship-pin",
                    start: "top 15%",
                    markers: false
                }
            });
            sideShip1Tl.to("#side-ship", 
                {
                    left: sideShipTranslate1,
                    ease: Linear.easeNone,
                    duration: 0.5,
                    delay: 0.25
                }
            );

            const sideShip2Tl = gsap.timeline({
                scrollTrigger: {
                    id: "sideShipSlideOnScroll",
                    trigger: "#side-ship-pin",
                    toggleActions: "play none none reset",
                    scrub: 1,
                    snap: [0, .428, .857],
                    start: `top+=${sideCloudHeight - sideShipHeightAdjusted + sideShipOffset - sideShipPinConstantOffset - sideShipTallScreenOffset}px top`,
                    end: "+=250%",
                    onUpdate: self => {
                        //handle target indicator bouncing
                        if (sideShip2Tl.currentLabel() === "slide1" && self.progress >= 0.1) {
                            //first active
                            targetBounce(1);
                        } else if (sideShip2Tl.currentLabel() === "slide2") {
                            //second active
                            targetBounce(2);
                        } else if (sideShip2Tl.currentLabel() === "slide3" && self.progress > 0.95) {
                            //third active
                            targetBounce(3);
                        }
                    },
                    onLeaveBack: () => {
                        //set scroll direction for target bounce
                        targetBounce(0);
                    },
                    markers: false
                }
            });
            sideShip2Tl.add("slide1", 0).add("slide2", "+=3").add("slide3", "+=6")
                .to("#slide-1 .text-container .vertical-middle", 
                    {
                        opacity: 1,
                        ease: Linear.easeNone,
                        duration: 0.5
                    },
                    "slide1"
                )
                .to("#slide-container .slide",
                    {
                        y: "-=100%",
                        ease: Linear.easeNone,
                        duration: 1
                    },
                    "slide2"
                )
                .fromTo("#side-ship",
                    { left: sideShipTranslate1 },
                    {
                        left: sideShipTranslate2,
                        ease: Linear.easeNone,
                        duration: 1
                    },
                    "slide2"
                )
                .to("#slide-container .slide",
                    {
                        y: "-=100%",
                        ease: Linear.easeNone,
                        duration: 1
                    },
                    "slide3"
                )
                .to("#side-ship",
                    {
                        left: sideShipTranslate3,
                        ease: Linear.easeNone,
                        duration: 1
                    },
                    "slide3"
                );

            textAnimateScenes(d.querySelector("#text-1 ~ .text-animate-container"), "text-2");

            //Slot machine style rollup
            const rollup2Tl = gsap.timeline({
                id: "rollupPinScene",
                scrollTrigger: {
                    trigger: "#text-rollup-2",
                    pin: "#text-rollup-2",
                    end: "+=100%",
                    start: `top+=${$("#text-rollup-2").height() * 0.5} center`,
                    markers: false

                }
            });
           ScrollTrigger.create({
               trigger: "#text-rollup-2",
               toggleActions: "play complete none reverse",
                start: `top+=${$("#text-rollup-2").height() * 0.5} top`,
                markers: false
            });
            rollup2Tl.add("top", 0).add("numbers", "+=0.25").add("bottom", "+=1.5")
                .fromTo('#text-rollup-2 .top', { opacity: 0 }, { opacity: 1, ease: Linear.easeInOut, duration: 0.5 }, "top")
                .to('#digit-1 .list', { y: "-=" + $("#digit-1 .list > li").height() * 9, ease: Circ.easeInOut, duration: 1 }, "numbers+=0.45")
                .to('#digit-2 .list', { y: "-=" + $("#digit-2 .list > li").height() * 9, ease: Circ.easeInOut, duration: 1 }, "numbers+=0.35")
                .to('#digit-3 .list', { y: "-=" + $("#digit-3 .list > li").height() * 8, ease: Circ.easeInOut, duration: 1 }, "numbers+=0.25")
                .to('#digit-4 .list', { y: "-=" + $("#digit-4 .list > li").height() * 8, ease: Circ.easeInOut, duration: 1 }, "numbers+=0.15")
                .to('#digit-5 .list', { y: "-=" + $("#digit-5 .list > li").height() * 8, ease: Circ.easeInOut, duration: 1 }, "numbers+=0.5")
                .fromTo('#text-rollup-2 .bottom', 0.5, { opacity: 0 }, { opacity: 1, ease: Linear.easeInOut }, "bottom");

            //Animates ship into port scene
            ScrollTrigger.create({
                id: "portPin",
                trigger: "#port-container",
                pin: "#port-container",
                start: `top top`,
                end: "+=200%",
                onEnter: () => {
                    //reverse wake
                    ocean.enterReversePhase();
                    ocean.setScrollSpeed(0);
                },
                onLeave: () => {
                    //normal wake
                    ocean.setScrollSpeed(0); 
                },
                onLeaveBack: () => {
                    ocean.exitReversePhase();
                    ocean.setScrollSpeed(-0.5);
                },
                markers: false
            });

            const portTl = gsap.timeline({
                scrollTrigger: {
                    id: "portTL",
                    trigger: "#port",
                    end: "+=115%",
                    scrub: 1,
                    start: "top+=20% top",
                    markers: false
                }
            });
            portTl.add(gsap.to("#ship-small-image", { y: portCenterConstantHeight + portHeightOffset + shipSmallConstantHeight / 2, ease: Linear.easeInOut, duration: 1 }));

            textAnimateScenes(d.querySelector(".vlcc-module-bottom .text-animate-container"), "text-3");

            d.querySelectorAll(".panel-animate").forEach((elem, index) => {
                panelAnimateScenes(elem, index);
            });

            textAnimateScenes(d.querySelector("#text-4"), "text-4");

            const mapTl = gsap.timeline({
                scrollTrigger: {
                    toggleActions: "play complete none reverse",
                    id: "mapTL",
                    trigger: "#map",
                    start: `top+=${$("#map").height() * 0.5} center`,
                    end: "+=70%",
                    markers: false
                }
            });
            mapTl.add("start", 0)
                .add("route2", "+=0.35")
                .add("route4", "+=0.55")
                .add("route3", "+=0.75")
                .to("#map-target-1", { opacity: 1, ease: Circ.easeInOut, duration: 0.5 }, "start")
                .to("#route-1", { strokeDashoffset: 0, ease: Circ.easeInOut, duration: 1.25 }, "start")
                .to("#route-2", { strokeDashoffset: 0, ease: Circ.easeInOut, duration: 1 }, "route2")
                .to("#map-target-2", { opacity: 1, ease: Circ.easeInOut, duration: 0.5 }, "route2")
                .to("#route-4", { strokeDashoffset: 0, ease: Circ.easeInOut, duration: 1.25 }, "route4")
                .to("#route-3", { strokeDashoffset: 0, ease: Circ.easeInOut, duration: 1 }, "route3")
                .to("#map-target-3", { opacity: 1, ease: Circ.easeInOut, duration: 0.5 }, "route3");

            ScrollTrigger.create({
                id: "mapPin",
                trigger: "#map",
                pin: "#map",
                start: `top+=${$("#map").height() * 0.5} center`,
                end: "+=100%",
                markers: false
            });

            textAnimateScenes(d.querySelector("#text-5"), "text-5");

            ScrollTrigger.create({
                id: "mapHideWaterScene",
                trigger: "#map",
                start: "top 0",
                toggleClass: {
                    targets: "#vlcc-1 .canvas-container",
                    className: "hidden"
                },
                markers: false
            });
        }); 
        
    };

    const initializeClouds = function () {

        $(".cloud-track.vertical .cloud").each(function (i) {
            const cloudContainerHeight = $("#clouds-container").height(),
                cloudWidth = $(this)[0].naturalWidth,
                cloudHeight = $(this)[0].naturalHeight,
                index = $(this).index(),
                posy = cloudContainerHeight + index * cloudHeight,
                posx = index * (Math.sin(Math.PI * 2 * index * cloudHeight / cloudContainerHeight) + 1) * cloudHeight / 20,
                width = (Math.sin(Math.PI * 2 * index * cloudHeight / cloudContainerHeight) + 2) * cloudWidth,
                distance = posy + 3 * $(this).height(),
                duration = (1 + i % 2) * distance / 25;

            $(this).css({ width: width, top: posy, left: posx, transform: 'rotate(' + 7 * (i % 2 - .5) + 'deg)'});
            gsap.timeline()
            .to(this, duration, {
                ease: Linear.easeNone,
                y: '-=' + distance,
                rotation: Math.sign(index % 2 - .5) * 180,
                repeat: -1
            });
        });

        $(".cloud-track.horizontal .cloud").each(function (i) {
            const cloudContainerWidth = $(this).parent().width(),
                cloudContainerHeight = $(this).parent().height(),
                cloudWidth = $(this)[0].naturalWidth,
                cloudHeight = $(this)[0].naturalHeight,
                index = $(this).index(),
                posx = cloudContainerWidth + index * cloudWidth,
                posy = index * (Math.sin(Math.PI * 2 * index * cloudHeight / cloudContainerHeight) + 1) * cloudHeight / 15,
                height = (Math.sin(Math.PI * 2 * index * cloudHeight / cloudContainerHeight) + 2) * cloudWidth,
                distance = posx + 3 * $(this).width(),
                duration = (1 + i % 2) * distance / 25;

            $(this).css({ height: height, top: posy, left: posx, transform: 'rotate(' + 13 * i + 'deg)' });
            gsap.timeline()
            .to(this, duration, {
                ease: Linear.easeNone,
                x: '-=' + distance,
                rotation: Math.sign(index % 2 - .5) * 90,
                repeat: -1
            });
        });

        $(".cloud").show();
    };

    const isMobile = function () {
        // device detection
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal/i.test(navigator.userAgent) ||
            /elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge /i.test(navigator.userAgent) ||
            /maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp/i.test(navigator.userAgent) ||
            /series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent));
    };
    $(w).on("load", function () {
        //Focus link in first scene will scroll to target in href. This can be resused if we need to scroll to scenes on load
        $(".animations-link").on("click", function (e) {
            e.preventDefault();
            $(this).toggleClass("off");
            $("#canvas-1").toggle();
            $(".cloud-track").toggle();
        });

        //set initial window dimensions (to be updated on resize)
        windowHeight = w.innerHeight;
        windowWidth = w.innerWidth;

        //Calling the init functions on load and resize
        initializeContainers();
        initializeDynamicTweens();
        initializeClouds();

        //start intro
        setTimeout(function () {
            $("#vlcc-loader").fadeOut(750, function (e) {
                $("#text-intro .fade-in").addClass("show");
            })
        }, 1000);

        const introPathLoop = function () {
            $("#text-intro .intro-path").css({ 'stroke-dashoffset': 100 }).animate({ 'stroke-dashoffset': 0 }, {
                duration: 2000,
                easing: 'linear',
                complete: introPathLoop
            });
        }
        introPathLoop();

        //var scrollPos;
        //trap resize and only trigger once stopped for 500ms
       let resizeVar,
            newWidth,
            newHeight;
        $(window).on("resize orientationchange", function (event) {
            newWidth = w.innerWidth;
            newHeight = w.innerHeight;
            if (event.type === "orientationchange") {
                //DO RESIZE HERE
                $("#vlcc-loader").show();
                clearTimeout(resizeVar);
                resizeVar = setTimeout(doneResizing, 500);
                return false;
            } else {
                if (isMobile() && newWidth !== windowWidth) {
                    //DO RESIZE HERE
                    $("#vlcc-loader").show();
                    clearTimeout(resizeVar);
                    resizeVar = setTimeout(doneResizing, 500);
                    return false;
                }
                if (!isMobile()) {
                    $("#vlcc-loader").show();
                    clearTimeout(resizeVar);
                    resizeVar = setTimeout(doneResizing, 500);
                }
            }
        });

        function doneResizing() {
            windowWidth = newWidth;
            windowHeight = newHeight;
            resetScenesAndTweens();
            $("#vlcc-loader").fadeOut(750);
        }

    });
})(window, document, jQuery);