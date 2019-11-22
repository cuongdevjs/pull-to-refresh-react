import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./styles.css";

import errorIcon from "./error-icon.png";
import downArrow from "./down-arrow.png";
import refreshIcon from "./refresh-icon.png";

function PTR(props) {
  // function
  function checkListLabel() {
    listLabel[0] = props.textError || listLabel[0];
    listLabel[1] = props.textStart || listLabel[1];
    listLabel[2] = props.textReady || listLabel[2];
    listLabel[3] = props.textRefresh || listLabel[3];
  }
  // constans
  const statusError = -1,
    statusStart = 0,
    statusReady = 1,
    statusRefresh = 2,
    listLabel = ["Error", "Start", "Ready", "Refresh"],
    animation = "all 0.2s ease",
    sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

  // ref
  const _pullDownContainer = useRef(null);
  const _pullDownHeader = useRef(null);
  const _pullDownLayer = useRef(null);
  const _iconPullDown = useRef(null);

  // state
  const [iconClass, setIconClass] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [label, setLabel] = useState("");
  const [height, setHeight] = useState(0);
  const [status, setStatus] = useState(statusStart);
  const [canPull, setCanPull] = useState(false);

  // local variable
  let _el = document,
    pullDownContainer = null,
    pullDownHeader = null,
    pullDownLayer = null,
    icon = null,
    children = null;
  let pullDownHeight =
    props.options && props.options.pullDownHeight
      ? props.options.pullDownHeight
      : 60;

  let reset = withAnimation => {
    if (withAnimation) {
      pullDownHeader.style.transition = animation;
    }
    if (isMounted) {
      setStatus(statusStart);
      setHeight(0);
    }
    pullDownLayer.style.zIndex = -1;
    pullDownContainer.style.height = "100%";
  };

  let touchPosition = {
    start: 0,
    distance: 0
  };
  let supportPassive = false;
  let options = Object.defineProperty({}, "passive", {
    get: () => {
      supportPassive = true;
      return true;
    }
  });
  _el.addEventListener("test", null, options);

  useEffect(() => {
    console.log("lifecycle");
    _el = document;
    pullDownContainer = _pullDownContainer.current;
    pullDownHeader = _pullDownHeader.current;
    pullDownLayer = _pullDownLayer.current;
    icon = _iconPullDown.current;
    children = pullDownLayer.nextElementSibling
      ? pullDownLayer.nextElementSibling
      : null;
    checkListLabel();
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    console.log("change status");
    let icon = document.querySelector(".pull-down-content--icon");
    setLabel(listLabel[status + 1]);
    setIconClass(
      status === statusError
        ? "pull-down-error"
        : status === statusRefresh
        ? "pull-down-refresh"
        : ""
    );

    if (status === statusError) {
      icon.style.backgroundImage = "url(" + errorIcon + ")";
    } else if (status === statusRefresh) {
      icon.style.backgroundImage = "url(" + refreshIcon + ")";
    } else {
      icon.style.backgroundImage = "url(" + downArrow + ")";
    }

    return () => {
      setLabel("");
      setIconClass("");
    };
  }, [status]);

  useEffect(() => {
    pullDownContainer.addEventListener(
      "touchstart",
      async e => {
        if (status !== statusRefresh) {
          let isTop = children
            ? children.getBoundingClientRect().top === 0
            : window.pageYOffset === 0;
          setCanPull(isTop);
          console.log(isMounted);
          console.log(isTop);
          console.log(canPull);
          touchPosition.start = e.touches[0].pageY;
          console.log("touchStart: ", touchPosition.start);
        }
      },
      supportPassive ? { passive: true } : false
    );

    pullDownContainer.addEventListener(
      "touchmove",
      async e => {
        // console.log(canPull);
        // console.log(status);
        if (status !== statusRefresh && canPull) {
          let distance = e.touches[0].pageY - touchPosition.start;
          distance = distance > 180 ? 180 : distance;

          distance > 0 && (pullDownContainer.style.height = "100vh");

          touchPosition.distance = distance;
          isMounted && setHeight(distance);

          if (distance > pullDownHeight) {
            isMounted && setStatus(statusReady);
            icon.style.transform = "rotate(180deg)";
          } else {
            isMounted && setStatus(statusStart);
            icon.style.transform = "rotate(" + distance + "deg)";
          }
        } else return;
      },
      supportPassive ? { passive: true } : false
    );

    pullDownContainer.addEventListener("touchend", async () => {
      if (status !== statusRefresh && canPull) {
        isMounted && setCanPull(false);
        pullDownHeader.style.transition = animation;

        if (
          touchPosition.distance - pullDownContainer.scrollTop >
          pullDownHeight
        ) {
          pullDownContainer.scrollTop = 0;
          if (isMounted) {
            setHeight(pullDownHeight);
            setStatus(statusRefresh);
            pullDownLayer.style.zIndex = 10;
          }
          if (props.onRefresh && typeof props.onRefresh === "function") {
            props
              .onRefresh()
              .then(async res => {
                if (!res) {
                  await sleep(1000);
                }
                reset(true);
              })
              .catch(err => {
                console.log("catch: ", err);
                reset(true);
                isMounted && setStatus(statusError);
              });
          } else {
            await sleep(2500);
            reset(false);
          }
        } else {
          reset(false);
        }
        touchPosition.distance = 0;
        touchPosition.start = 0;
        console.log("touchEnd: ", height);
      } else return;
    });

    pullDownHeader.addEventListener("transitionend", () => {
      pullDownHeader.style.transition = "";
    });

    pullDownHeader.addEventListener("webkitTransitionEnd", () => {
      pullDownHeader.style.transition = "";
    });

    return () => {};
  }, [isMounted, canPull, status]);

  return (
    <div className="pull-down-container" ref={_pullDownContainer}>
      <div
        className="pull-down-header"
        style={{ height: height + "px" }}
        ref={_pullDownHeader}
      >
        <div className="pull-down-content">
          <i
            className={"pull-down-content--icon " + iconClass}
            ref={_iconPullDown}
          />
          <div className="pull-down-content--label">{label}</div>
        </div>
      </div>
      <div className={"pull-down-layer"} ref={_pullDownLayer} />
      {props.children}
    </div>
  );
}

PTR.propTypes = {
  options: PropTypes.object,
  children: PropTypes.node,
  onRefresh: PropTypes.func.isRequired,
  textError: PropTypes.string,
  textStart: PropTypes.string,
  textReady: PropTypes.string,
  textRefresh: PropTypes.string
};

export default PTR;
