/* This editor and its code is copyrighted by Jose Raul Romero.
No public use, partial modification or adaptation should be performed without explicit permission.
Please, contact at jrromero-at-uco-dot-es to make use of it, and report any contribution to the project.
*/
var ApplicationValues = {
    element_color: "#ffffbb",
    dialog: new Dialog()
};
var Application = function(a) {
    a = a || {};
    if (!(a.id && a.width && a.height)) {
        return
    }
    this._width = a.width;
    this._height = a.height;
    this._generateStructure(a.id);
    this._generateGeneralMenu();
    this._selected = null;
    this._diagrams = [];
    this._tabs = [];
    this.setProfileSpecificMenu()
};
var _acceptedDiagrams = [];
var _acceptedElementsUML = [];
var _genericMenu = [];
var _specificMenu = [];
var _stereotypes = [];
var _metaclass = [];
var _delProfileElement = function(b) {
    if (b.getType() == "UMLMetaclass") {
        for (var a in _metaclass) {
            if (_metaclass[a] == b) {
                _metaclass.splice(a, 1)
            }
        }
    }
    if (b.getType() == "UMLStereotype") {
        for (var a in _stereotypes) {
            if (_stereotypes[a] == b) {
                _stereotypes.splice(a, 1)
            }
        }
    }
};
Application.prototype._generateStructure = function(b) {
    var g = document.getElementById(b);
    var d = document.createElement("div");
    d.setAttribute("id", "ud_tools_div");
    var f = document.createElement("ul");
    f.setAttribute("id", "ud_tools_ul1");
    var e = document.createElement("ul");
    e.setAttribute("id", "ud_tools_ul2");
    d.appendChild(f);
    d.appendChild(e);
    g.appendChild(d);
    this._tools_div = d;
    this._tools_ul1 = f;
    this._tools_ul2 = e;
    var l = document.createElement("div");
    l.setAttribute("id", "ud_container_div");
    var n = document.createElement("div");
    n.setAttribute("id", "ud_selector_div");
    var a = document.createElement("ul");
    a.setAttribute("id", "ud_selector_ul");
    n.appendChild(a);
    l.appendChild(n);
    this._selector_ul = a;
    var j = document.createElement("div");
    j.setAttribute("id", "ud_diagram_div");
    j.setAttribute("class", "ud_diagram_div");
    j.style.width = this._width + "px";
    j.style.height = this._height + "px";
    this._diagram_div = j;
    l.appendChild(j);
    g.appendChild(l);
    var c;
    c = document.createElement("canvas");
    c.setAttribute("class", "ud_diagram_canvas");
    c.width = this._width;
    c.height = this._height;
    j.appendChild(c);
    this._mainContext = c.getContext("2d");
    this._mainCanvas = c;
    c = document.createElement("canvas");
    c.setAttribute("class", "ud_diagram_canvas");
    c.width = this._width;
    c.height = this._height;
    c.onmousedown = function() {
        return false
    };
    j.appendChild(c);
    this._motionContext = c.getContext("2d");
    var h = document.createElement("div");
    h.setAttribute("id", "ud_update_div");
    h.title = "apply changes in profile to diagrams";
    h.style.right = 15 + "px";
    h.style.display = "none";
    j.appendChild(h);
    var k = this;
    h.onclick = function() {
        ApplicationValues.dialog._text = "Do you want to update the diagrams according to the changes of the profile?";
        ApplicationValues.dialog._cancelable = true;
        if (k._selected && k._diagrams[k._selected].getType() == "UMLProfile") {
            ApplicationValues.dialog.show(function() {
                var o = [];
                for (i in k._diagrams) {
                    if (k._diagrams[i].getType() != "UMLProfile") {
                        o.push(k._diagrams[i])
                    }
                }
                k._diagrams[k._selected].updateProfile(o)
            })
        }
    };
    var m = document.createElement("div");
    m.setAttribute("id", "ud_delete_div");
    j.appendChild(m);
    var k = this;
    m.onclick = function() {
        ApplicationValues.dialog._text = 'Do you want to delete the diagram "' + k._diagrams[k._selected].getName() + '"?';
        ApplicationValues.dialog._cancelable = true;
        if (k._selected) {
            ApplicationValues.dialog.show(function() {
                k._delDiagram();
                k._generateSpecificMenu()
            })
        }
    }
};
Application.prototype._changeTabName = function(c) {
    var e = this._diagrams[c].getName();
    if (e.length > 20) {
        e = e.substring(0, 17);
        e += "..."
    }
    var b = this._tabs[c];
    var d = b.firstChild;
    var a = d.firstChild;
    d.removeChild(a);
    d.appendChild(document.createTextNode(e))
};
Application.prototype._addTab = function(b) {
    var a = document.createElement("li");
    var d = document.createElement("a");
    d.appendChild(document.createTextNode(""));
    a.appendChild(d);
    this._selector_ul.appendChild(a);
    this._tabs[b] = a;
    var c = this;
    a.onclick = function() {
        if (c._selected == b) {
            ApplicationValues.dialog._text = "Diagram name:";
            ApplicationValues.dialog._cancelable = true;
            var e = c._diagrams[b];
            ApplicationValues.dialog.show(function(f) {
                if (f == "") {
                    f = "Untitle"
                }
                e.setName(f);
                c._changeTabName(b);
                e.draw()
            }, e.getName())
        } else {
            c._selectDiagram(b)
        }
    };
    this._changeTabName(b)
};
Application.prototype._delTab = function(a) {
    this._selector_ul.removeChild(this._tabs[a]);
    delete this._tabs[a]
};
Application.prototype._generateIndex = function() {
    var a = Math.random();
    while (true) {
        if (a in this._diagrams) {
            a = Math.random()
        } else {
            return a
        }
    }
};
Application.prototype.addDiagram = function(a) {
    var b = this._generateIndex();
    a.initialize(b, this._diagram_div, this._mainContext, this._motionContext, this._width, this._height);
    this._diagrams[b] = a;
    this._diagrams[b].setUpdateHeightCanvas(true);
    this._diagrams[b].setUpdateWidthCanvas(true);
    if (a.isVisible()) {
        this._addTab(b)
    }
    this._selectDiagram(b)
};
Application.prototype._delDiagram = function() {
    var a = this._selected;
    if (a) {
        this._diagrams[a].interaction(false);
        this._delTab(a);
        if (this._diagrams[a].getType() == "UMLProfile") {
            var c = [];
            for (b in this._diagrams) {
                if (this._diagrams[b].getType() != "UMLProfile") {
                    c.push(this._diagrams[b])
                }
            }
            this._diagrams[a].removeProfile(c);
            for (b = 0; b < this._diagrams[a]._nodes.length; b++) {
                _delProfileElement(this._diagrams[a]._nodes[b])
            }
        }
        delete this._diagrams[a];
        this._selected = null;
        var b;
        for (b in this._diagrams) {
            if (this._diagrams[b]._visible) {
                this._selectDiagram(b);
                return
            }
        }
        this._clearCanvas()
    }
};
Application.prototype._clearCanvas = function() {
    this._mainContext.clearRect(0, 0, this._width, this._height);
    this._motionContext.clearRect(0, 0, this._width, this._height)
};
Application.prototype._selectDiagram = function(b) {
    if (this._selected && this._diagrams[b].isVisible()) {
        this._diagrams[this._selected].interaction(false);
        this._tabs[this._selected].removeAttribute("class")
    }
    this._clearCanvas();
    this._diagrams[b].draw();
    this._diagrams[b].interaction(true);
    if (this._diagrams[b].isVisible()) {
        this._selected = b;
        this._tabs[b].setAttribute("class", "active");
        this._generateSpecificMenu();
        var a = document.getElementById("ud_update_div"); /* http://www.jrromero.net/tools/jsUML2 */
        if (this._diagrams[b].getType() == "UMLProfile") {
            a.style.display = "block"
        } else {
            a.style.display = "none"
        }
    }
};
Application.prototype._getDiagramImage = function() {
    if (this._selected) {
        this._diagrams[this._selected].stopEvents();
        this._diagrams[this._selected].draw();
        return this._mainCanvas.toDataURL("image/png")
    }
};
Application.prototype._generateGeneralMenu = function() {
    var e = this;
    var g = this._tools_div;
    var c = document.createElement("h1");
    var f = document.createTextNode("Actions");
    var b = document.createElement("img");
    b.setAttribute("src", "img/app/vertical_flow.png");
    c.appendChild(b);
    c.appendChild(f);
    g.insertBefore(c, this._tools_ul1);
    c.onclick = function() {
        var j = document.getElementById("ud_tools_ul1");
        var h;
        if (j.style.display == "none") {
            j.style.display = "block";
            this.childNodes[0].setAttribute("src", "img/app/vertical_flow.png")
        } else {
            j.style.display = "none";
            this.childNodes[0].setAttribute("src", "img/app/horizontal_flow.png")
        }
    };
    this._addMenuItem(this._tools_ul1, "Export/Import to Shacl xml", function(m) {
        var p = this;
        this._active = true;
        var h = document.createElement("div");
        var j = document.createElement("form");
        var k = document.createElement("textarea");
        var u = document.createElement("input");
        var q = document.createElement("input");
        var t = document.createElement("input");
        var s = document.createElement("input");
        h.className = "ud_popup";
        k.setAttribute("rows", 15);
        k.setAttribute("cols", 90);
        u.setAttribute("type", "submit");
        u.setAttribute("value", "Import");
        q.setAttribute("type", "submit");
        q.setAttribute("value", "Export All");
        t.setAttribute("type", "submit");
        t.setAttribute("value", "Export Current Diagram");
        s.setAttribute("type", "submit");
        s.setAttribute("value", "x");
        var n = function(v) {
            m.setXMLString(k.value);
            document.body.removeChild(h)
        };
        var r = function(v) {
            k.value = m.getXMLString();
            k.select()
        };
        var l = function(v) {
            k.value = m.getCurrentXMLString();
            k.select()
        };
        var o = function(v) {
            document.body.removeChild(h)
        };
        j.onsubmit = function() {
            return false
        };
        q.addEventListener("click", r, false);
        t.addEventListener("click", l, false);
        u.addEventListener("click", n, false);
        s.addEventListener("click", o, false);
        j.appendChild(q);
        j.appendChild(t);
        j.appendChild(u);
        j.appendChild(s);
        j.appendChild(document.createElement("br"));
        j.appendChild(k);
        h.appendChild(j);
        document.body.appendChild(h);
        k.focus();
        h.style.top = (window.innerHeight - j.offsetHeight) / 2 + "px";
        h.style.left = (window.innerWidth - j.offsetWidth) / 2 + "px"
    }, 0, "import_export");
    this._addMenuItem(this._tools_ul1, "Generate image (png)", function(k, j) {
        if (k._selected) {
            var h = window.open(k._getDiagramImage(), "diagramImage", "height=" + (k._height + 70) + ",width=" + (k._width + 20));
            h.focus()
        } else {
            alert("You did not select any diagram")
        }
    }, 0, "generate_image");
    this._addMenuItem(this._tools_ul1, "Delete object", function(l, h, p) {
        var n = l.getElementByPoint(h, p);
        if (n) {
            var o = false;
            var m = "";
            for (var j = 0; j < n._components.length && !o; j++) {
                if (n._components[j].getId() == "name") {
                    m = n._components[j]._text;
                    o = true
                }
            }
            if (m != "") {
                m = ' "' + m + '" '
            }
            ApplicationValues.dialog._text = "Do you want to delete the object" + m + " (" + n.getType() + ") ?";
            ApplicationValues.dialog._cancelable = true
        }
        if (n != null && n instanceof Element) {
            ApplicationValues.dialog.show(function() {
                l.delElement(n);
                l.draw();
                _delProfileElement(n)
            })
        }
    }, 1, "delete_object");
    this._addMenuItem(this._tools_ul1, "Modify color", function(x) {
        var r = ApplicationValues.element_color;
        var z = ApplicationValues.element_color.split("#")[1];
        var C = new Array(parseInt(z.slice(0, 2), 16), parseInt(z.slice(2, 4), 16), parseInt(z.slice(4, 6), 16));
        var A = document.createElement("div");
        A.className = "ud_popupColor";
        var J = document.createElement("div");
        J.setAttribute("id", "divBlock1");
        var I = document.createElement("div");
        I.setAttribute("id", "divBlock2");
        var n = document.createElement("div");
        n.setAttribute("id", "colorHtml");
        n.style.color = "#ffffff";
        var h = document.createElement("div");
        h.setAttribute("id", "red");
        var y = document.createElement("canvas");
        y.setAttribute("id", "R");
        y.width = 150;
        y.height = 20;
        h.appendChild(y);
        var j = y.getContext("2d");
        var s = document.createElement("div");
        s.setAttribute("id", "green");
        var B = document.createElement("canvas");
        B.setAttribute("id", "G");
        B.width = 150;
        B.height = 20;
        s.appendChild(B);
        var t = B.getContext("2d");
        var v = document.createElement("div");
        v.setAttribute("id", "blue");
        var D = document.createElement("canvas");
        D.setAttribute("id", "B");
        D.width = 150;
        D.height = 20;
        v.appendChild(D);
        var w = D.getContext("2d");
        var u = document.createElement("div");
        u.setAttribute("id", "divSelectColor");
        var G = document.createElement("canvas");
        G.setAttribute("id", "selectColor");
        G.width = 90;
        G.height = 90;
        u.appendChild(G);
        var l = G.getContext("2d");
        var m = document.createElement("form");
        var K = document.createElement("input");
        K.setAttribute("type", "submit");
        K.setAttribute("value", "ok");
        var H = document.createElement("input");
        H.setAttribute("type", "submit");
        H.setAttribute("value", "cancel");
        var F = function(L) {
            document.body.removeChild(A)
        };
        var q = function(L) {
            ApplicationValues.element_color = r;
            document.body.removeChild(A)
        };
        K.addEventListener("click", F, false);
        H.addEventListener("click", q, false);
        m.onsubmit = function() {
            return false
        };
        K.focus();
        m.appendChild(K);
        m.appendChild(H);
        J.appendChild(n);
        J.appendChild(h);
        J.appendChild(s);
        J.appendChild(v);
        J.appendChild(m);
        A.appendChild(J);
        I.appendChild(u);
        I.appendChild(document.createElement("div"));
        A.appendChild(I);
        var E = function(N, M, O, L) {
            if (O == 0) {
                O = 0.1
            } else {
                if (O == 120) {
                    O = 119.9
                }
            }
            M.save();
            M.font = "12px monospace";
            M.textBaseline = "middle";
            M.fillStyle = "#ffffff";
            M.fillText(N.getAttribute("id"), 0, N.height / 2);
            M.restore();
            M.save();
            M.beginPath();
            M.fillStyle = L;
            M.fillRect(20, 0, parseInt(N.width) - 50, y.height);
            M.closePath();
            M.restore();
            M.fillStyle = "#000000";
            M.beginPath();
            M.arc(20 + (O * 100) / 255, parseInt(N.height) / 2, 4, 0, Math.PI * 2, true);
            M.closePath();
            M.fill();
            M.save();
            M.font = "12px monospace";
            M.textBaseline = "middle";
            M.fillStyle = "#ffffff";
            M.fillText(parseInt(O), 125, N.height / 2);
            M.restore()
        };
        var p = function(L) {
            l.save();
            l.beginPath();
            l.fillStyle = L;
            l.fillRect(20, 20, 80, 80);
            l.closePath();
            l.restore()
        };
        var o = function(N) {
            var M = function(R) {
                var P = "0123456789ABCDEF";
                var O = parseInt(R) % 16;
                var Q = (parseInt(R) - O) / 16;
                hex = "" + P.charAt(Q) + P.charAt(O);
                return hex
            };
            var L = M(N[0]) + M(N[1]) + M(N[2]);
            while (n.hasChildNodes()) {
                n.removeChild(n.lastChild)
            }
            n.appendChild(document.createTextNode("#"));
            n.appendChild(document.createTextNode(L));
            ApplicationValues.element_color = "#" + L
        };
        var k = function(N) {
            var M = N.pageX - A.offsetLeft - this.offsetLeft;
            var L = N.pageY - this.offsetTop;
            if (this.getAttribute("id") == "red") {
                C[0] = ((M - 20) * 255) / 100;
                if (C[0] > 255) {
                    C[0] = 255
                }
                if (C[0] < 0) {
                    C[0] = 0
                }
                j.clearRect(0, 0, parseInt(y.width), y.height);
                E(y, j, C[0], "#ff0000")
            }
            if (this.getAttribute("id") == "green") {
                C[1] = ((M - 20) * 255) / 100;
                if (C[1] > 255) {
                    C[1] = 255
                }
                if (C[1] < 0) {
                    C[1] = 0
                }
                t.clearRect(0, 0, parseInt(B.width), B.height);
                E(B, t, C[1], "#00ff00")
            }
            if (this.getAttribute("id") == "blue") {
                C[2] = ((M - 20) * 255) / 100;
                if (C[2] > 255) {
                    C[2] = 255
                }
                if (C[2] < 0) {
                    C[2] = 0
                }
                w.clearRect(0, 0, parseInt(D.width), D.height);
                E(D, w, C[2], "#0000ff")
            }
            o(C);
            p(ApplicationValues.element_color);
            x.updateBackgroundElementDiagram()
        };
        E(y, j, C[0], "#ff0000");
        E(B, t, C[1], "#00ff00");
        E(D, w, C[2], "#0000ff");
        p(ApplicationValues.element_color);
        o(C);
        h.addEventListener("mousedown", k, false);
        s.addEventListener("mousedown", k, false);
        v.addEventListener("mousedown", k, false);
        document.body.appendChild(A);
        A.style.top = (window.innerHeight - parseInt(A.offsetHeight)) / 2 + "px";
        A.style.left = (window.innerWidth - parseInt(A.offsetWidth)) / 2 + "px"
    }, 0, "modify_color");
    var a = _genericMenu;
    var d;
    for (d in a) {
        if (a[d].length == 3) {
            this._addMenuItem(this._tools_ul1, a[d][0], a[d][1], a[d][2])
        } else {
            if (a[d].length == 4) {
                this._addMenuItem(this._tools_ul1, a[d][0], a[d][1], a[d][2], a[d][3])
            }
        }
    }
    g = this._tools_div;
    c = document.createElement("h1");
    f = document.createTextNode("Diagram elements");
    c.onclick = function() {
        var j = document.getElementById("ud_tools_ul2");
        var h;
        if (j.style.display == "none") {
            j.style.display = "block";
            this.childNodes[0].setAttribute("src", "img/app/vertical_flow.png")
        } else {
            j.style.display = "none";
            this.childNodes[0].setAttribute("src", "img/app/horizontal_flow.png")
        }
    };
    b = document.createElement("img");
    b.setAttribute("src", "img/app/vertical_flow.png");
    c.appendChild(b);
    c.appendChild(f);
    g.insertBefore(c, this._tools_ul2)
};
Application.prototype._generateSpecificMenu = function() {
    var c;
    var d = this._tools_ul2;
    while (d.hasChildNodes()) {
        d.removeChild(d.firstChild)
    }
    if (this._selected) {
        var c, b;
        var a = _specificMenu[this._diagrams[this._selected].getType()];
        for (c in a) {
            if (a[c].length == 4) {
                this._addMenuItem(this._tools_ul2, a[c][0], a[c][1], a[c][2], a[c][3])
            } else {
                if (a[c].length == 3) {
                    this._addMenuItem(this._tools_ul2, a[c][0], a[c][1], a[c][2])
                }
            }
        }
        this._addMenuItem(this._tools_ul2, "Note", function(f, e, g) {
            f.addElement(new UMLNote({
                x: e,
                y: g
            }))
        }, 1, "UMLNote");
        this._addMenuItem(this._tools_ul2, "Anchor", function(k, j, m, h, l) {
            var g = k.getElementByPoint(j, m);
            var f = k.getElementByPoint(h, l);
            if (g != null) {
                if (!f) {
                    f = new UMLNote({
                        x: h,
                        y: l
                    });
                    k.addElement(f)
                }
                var e = new UMLLine({
                    a: g,
                    b: f
                });
                k.addElement(e)
            }
        }, 2, "UMLAnchor")
    }
};
Application.prototype.updateBackgroundElementDiagram = function() {
    for (i in this._diagrams) {
        this._diagrams[i].setBackgroundNodes(ApplicationValues.element_color)
    }
};
Application.prototype._interactionSingleClick = function(d) {
    var b = this._diagrams[this._selected];
    b.interaction(false);
    var c = this;
    var a = function(g) {
        var f = g.pageX - c._diagram_div.offsetLeft;
        var e = g.pageY - c._diagram_div.offsetTop;
        d(b, f, e);
        c._diagram_div.onclick = false;
        b.draw();
        b.interaction(true)
    };
    this._diagram_div.onclick = a
};
Application.prototype._interactionDoubleClick = function(g) {
    var c = this._diagrams[this._selected];
    c.interaction(false);
    var b = 0,
        d = 0;
    var f = true;
    var e = this;
    var a = function(k) {
        var j = k.pageX - e._diagram_div.offsetLeft;
        var h = k.pageY - e._diagram_div.offsetTop;
        if (f) {
            f = false;
            b = j;
            d = h
        } else {
            g(c, b, d, j, h);
            e._diagram_div.onclick = false;
            c.draw();
            c.interaction(true)
        }
    };
    this._diagram_div.onclick = a
};
Application.prototype._addMenuItem = function(a, g, f, k, b) {
    var h = document.createElement("li");
    var e = document.createElement("a");
    var j = document.createTextNode(g);
    if (b) {
        var c = document.createElement("img");
        c.setAttribute("src", "img/app/" + b + ".png");
        h.appendChild(c)
    }
    e.appendChild(j);
    h.appendChild(e);
    a.appendChild(h);
    var d = this;
    switch (k) {
        case 0:
            h.addEventListener("click", function() {
                if (d._selected) {
                    f(d, d._diagrams[d._selected])
                } else {
                    f(d)
                }
            }, false);
            break;
        case 1:
            h.addEventListener("click", function() {
                if (d._selected) {
                    d._interactionSingleClick(f)
                }
            }, false);
            break;
        case 2:
            h.addEventListener("click", function() {
                if (d._selected) {
                    d._interactionDoubleClick(f)
                }
            }, false);
            break;
        default:
            break
    }
};
Application.prototype.getXML = function() {
    var b = (new DOMParser()).parseFromString("<umldiagrams/>", "text/xml");
    var d = b.getElementsByTagName("umldiagrams")[0];
    var a;
    var c;
    for (c in this._diagrams) {
        a = this._diagrams[c].getXML(b);
        d.appendChild(a)
    }
    return b
};
Application.prototype.getCurrentXML = function() {
    var b = (new DOMParser()).parseFromString("<umldiagrams/>", "text/xml");
    var c = b.getElementsByTagName("umldiagrams")[0];
    var a;
    a = this._diagrams[this._selected].getXML(b);
    c.appendChild(a);
    return b
};
Application.prototype.getXMLString = function() {
    return (new XMLSerializer()).serializeToString(this.getXML())
};
Application.prototype.getCurrentXMLString = function() {
    return (new XMLSerializer()).serializeToString(this.getCurrentXML())
};
Application.prototype.setXML = function(xml) {
    var application = xml.getElementsByTagName("umldiagrams")[0];
    if (!application) {
        alert("Not found a valid XML string");
        return
    }
    var xmlnodes = application.childNodes;
    var aux, nodeName;
    var i, j;
    for (i = 0; i < xmlnodes.length; i++) {
        nodeName = xmlnodes[i].nodeName;
        for (j in _acceptedDiagrams) {
            if (nodeName == _acceptedDiagrams[j]) {
                aux = eval("new " + nodeName + "()");
                if (nodeName != "UMLProfile") {
                    aux.setXML(xmlnodes[i], _stereotypes)
                } else {
                    aux.setXML(xmlnodes[i], this._diagrams, _acceptedElementsUML);
                    this.storeInformationProfile(aux)
                }
                this.addDiagram(aux);
                break
            }
        }
    }
};
Application.prototype.storeInformationProfile = function(b) {
    var c = b.getElements();
    for (var a = 0; a < c[0].length; a++) {
        _metaclass.push(c[0][a])
    }
    for (a = 0; a < c[1].length; a++) {
        _stereotypes.push(c[1][a])
    }
};
Application.prototype.foundInArray = function(c, b) {
    for (var a = 0; a < c.length; a++) {
        if (b == c[a]) {
            return true
        }
    }
    return false
};
Application.prototype.setXMLString = function(a) {
    a = a.replace(/\n/gi, "");
    this.setXML((new DOMParser()).parseFromString(a, "text/xml"))
};
_acceptedDiagrams.push("UMLUseCaseDiagram");
_acceptedElementsUML.push(["Actor", "UMLActor"], ["Use Case", "UMLUseCase"], ["UseCaseExtended", "UMLUseCaseExtended"], ["UseCaseClassifier", "UMLUseCaseClassifier"], ["System", "UMLSystem"], ["SubSystem", "UMLSubSystem"]);
_genericMenu.push(["New use case diagram", function(a) {
    a.addDiagram(new UMLUseCaseDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLUseCaseDiagram"]);
_specificMenu.UMLUseCaseDiagram = [
    ["Actor", function(b, a, d) {
        var c = new UMLActor({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLActor"],
    ["Use case", function(b, a, d) {
        var c = new UMLUseCase({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLUseCase"],
    ["UseCaseExtended", function(b, a, d) {
        var c = new UMLUseCaseExtended({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLUseCaseExtended"],
    ["UseCaseClassifier", function(b, a, d) {
        var c = new UMLUseCaseClassifier({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLUseCaseClassifier"],
    ["System", function(b, a, d) {
        var c = new UMLSystem({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLSystem"],
    ["SubSystem", function(b, a, d) {
        var c = new UMLSubSystem({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLSubSystem"],
    ["Communication", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLCommunication(), b, e, a, d)
    }, 2, "UMLCommunication"],
    ["Extend", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLExtend(), b, e, a, d)
    }, 2, "UMLExtend"],
    ["Include", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLInclude(), b, e, a, d)
    }, 2, "UMLInclude"],
    ["Generalization", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && b.getType() == "UMLGeneralizationSet") {
            b.addElement(a);
            e.addElement(b.getRelation(a))
        } else {
            if (a && a.getType() == "UMLGeneralizationSet") {
                a.addElement(b);
                e.addElement(a.getRelation(b))
            } else {
                e.addRelationFromPoints(new UMLGeneralization(), d, g, c, f)
            }
        }
    }, 2, "UMLGeneralization"],
    ["Generalization set", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLGeneralizationSet(), b, e, a, d)
    }, 2, "UMLGeneralizationSet"],
];
_acceptedDiagrams.push("UMLClassDiagram");
_acceptedElementsUML.push(["Class", "UMLClass"], ["Data Type", "UMLDataType"], ["Association N-ary", "UMLNAssociation"], ["Component (Class diagram)", "UMLComponent"], ["Instance", "UMLInstance"], ["Interface Extended", "UMLInterfaceExtended"], ["UMLPackage", "Package"], ["Package Container", "UMLPackageContainer"], ["Generalization Set", "UMLGeneralizationSet"]);
_genericMenu.push(["New Shacl class diagram", function(a) {
    a.addDiagram(new UMLClassDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLClassDiagram"]);
_specificMenu.UMLClassDiagram = [
    ["Package", function(b, a, d) {
        var c = new UMLPackage({
            x: a,
            y: d,
            stereotypes: _stereotypes
        }); /* http://www.jrromero.net/tools/jsUML2 */
        b.addElement(c)
    }, 1, "UMLPackage"],
    ["Package container", function(b, a, d) {
        var c = new UMLPackageContainer({
            x: a,
            y: d,
            stereotypes: _stereotypes
        }); /* http://www.jrromero.net/tools/jsUML2 */
        b.addElement(c)
    }, 1, "UMLPackageContainer"],
    ["Class", function(b, a, d) {
        var c = new UMLClass({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLClass"],
    ["Component", function(b, a, d) {
        var c = new UMLComponent({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLComponent"],
    ["DataType", function(b, a, d) {
        var c = new UMLDataType({
            x: a,
            y: d,
            stereotypes: _stereotypes
        }); /* http://www.jrromero.net/tools/jsUML2 */
        b.addElement(c)
    }, 1, "UMLDataType"],
    ["Instance", function(b, a, d) {
        var c = new UMLInstance({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInstance"],
    ["Interface", function(b, a, d) {
        var c = new UMLInterfaceExtended({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInterfaceExtended"],
    ["N-ary association", function(b, a, d) {
        var c = new UMLNAssociation({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLNAssociation"],
    ["Generalization", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g); /* http://www.jrromero.net/tools/jsUML2 */
        var a = e.getElementByPoint(c, f);
        if (b && b.getType() == "UMLGeneralizationSet") {
            b.addElement(a);
            e.addElement(b.getRelation(a))
        } else {
            if (a && a.getType() == "UMLGeneralizationSet") {
                a.addElement(b);
                e.addElement(a.getRelation(b))
            } else {
                e.addRelationFromPoints(new UMLGeneralization(), d, g, c, f)
            }
        }
    }, 2, "UMLGeneralization"],
    ["Generalization set", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLGeneralizationSet(), b, e, a, d)
    }, 2, "UMLGeneralizationSet"],
    ["Association", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && b.getType() == "UMLNAssociation") {
            b.addElement(a);
            e.addElement(b.getRelation(a))
        } else {
            if (a && a.getType() == "UMLNAssociation") {
                a.addElement(b);
                e.addElement(a.getRelation(b))
            } else {
                e.addRelationFromPoints(new UMLAssociation(), d, g, c, f)
            }
        }
    }, 2, "UMLAssociation"],
    ["Aggregation", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLAggregation(), b, e, a, d)
    }, 2, "UMLAggregation"],
    ["Composition", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLComposition(), b, e, a, d)
    }, 2, "UMLComposition"],
    ["Dependency", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLDependency(), b, e, a, d)
    }, 2, "UMLDependency"],
    ["Realization", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLRealization(), b, e, a, d)
    }, 2, "UMLRealization"],
    ["Usage", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLUsage(), b, e, a, d)
    }, 2, "UMLUsage"],
    ["Package merge", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLPackageMerge(), b, e, a, d)
    }, 2, "UMLPackageMerge"],
    ["Package public import", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLPackagePublicImport(), b, e, a, d)
    }, 2, "UMLPackagePublicImport"],
    ["Package private import", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLPackagePrivateImport(), b, e, a, d)
    }, 2, "UMLPackagePrivateImport"]
];
_acceptedDiagrams.push("UMLPackageDiagram");
_acceptedElementsUML.push(["UMLPackage", "Package"], ["Package Container", "UMLPackageContainer"]);
_genericMenu.push(["New package diagram", function(a) {
    a.addDiagram(new UMLPackageDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLPackageDiagram"]);
_specificMenu.UMLPackageDiagram = [
    ["Package", function(b, a, d) {
        var c = new UMLPackage({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLPackage"],
    ["Package container", function(b, a, d) {
        var c = new UMLPackageContainer({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLPackageContainer"],
    ["Dependency", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLDependency(), b, e, a, d)
    }, 2, "UMLDependency"],
    ["Package merge", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLPackageMerge(), b, e, a, d)
    }, 2, "UMLPackageMerge"],
    ["Package public import", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLPackagePublicImport(), b, e, a, d)
    }, 2, "UMLPackagePublicImport"],
    ["Package private import", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLPackagePrivateImport(), b, e, a, d)
    }, 2, "UMLPackagePrivateImport"]
];
_acceptedDiagrams.push("UMLInstanceDiagram");
_acceptedElementsUML.push(["UMLInstance", "Instance"]);
_genericMenu.push(["New instance diagram", function(a) {
    a.addDiagram(new UMLInstanceDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLInstanceDiagram"]);
_specificMenu.UMLInstanceDiagram = [
    ["Instance", function(b, a, d) {
        var c = new UMLInstance({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInstance"],
    ["Link", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLLink(), b, e, a, d)
    }, 2, "UMLLink"]
];
_acceptedDiagrams.push("UMLComponentDiagram");
_acceptedElementsUML.push(["Component (Component diagram)", "UMLComComponent"], ["Interface", "UMLInterface"], ["Artifact", "UMLArtifact"], ["Class", "UMLClass"]);
_genericMenu.push(["New component diagram", function(a) {
    a.addDiagram(new UMLComponentDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLComponentDiagram"]);
_specificMenu.UMLComponentDiagram = [
    ["Package", function(b, a, d) {
        var c = new UMLPackage({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLPackage"],
    ["Package container", function(b, a, d) {
        var c = new UMLPackageContainer({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLPackageContainer"],
    ["Artifact", function(b, a, d) {
        var c = new UMLArtifact({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLArtifact"],
    ["Class", function(b, a, d) {
        var c = new UMLClass({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLClass"],
    ["Component", function(b, a, d) {
        var c = new UMLComComponent({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLComponent"],
    ["Add Port", function(b, a, e) {
        var d = b.getElementByPoint(a, e);
        if (d != null && d.getType() == "UMLComComponent") {
            var c = new UMLPort({
                stereotypes: _stereotypes
            });
            d.addPort(c)
        }
    }, 1, "UMLPort"],
    ["Interface", function(b, a, d) {
        var c = new UMLInterface({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInterface"],
    ["Interface (extended notation)", function(b, a, d) {
        var c = new UMLInterfaceExtended({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInterfaceExtended"],
    ["N-ary association", function(b, a, d) {
        var c = new UMLNAssociation({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLNAssociation"],
    ["Interface usage", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLInterfaceUsage(), b, e, a, d)
    }, 2, "UMLInterfaceUsage"],
    ["Interface use", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLInterfaceUse(), b, e, a, d)
    }, 2, "UMLInterfaceUse"],
    ["Interface realization", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLInterfaceRealization(), b, e, a, d)
    }, 2, "UMLInterfaceRealization"],
    ["Generalization", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && b.getType() == "UMLGeneralizationSet") {
            b.addElement(a);
            e.addElement(b.getRelation(a))
        } else {
            if (a && a.getType() == "UMLGeneralizationSet") {
                a.addElement(b);
                e.addElement(a.getRelation(b))
            } else {
                e.addRelationFromPoints(new UMLGeneralization(), d, g, c, f)
            }
        }
    }, 2, "UMLGeneralization"],
    ["Generalization set", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLGeneralizationSet(), b, e, a, d)
    }, 2, "UMLGeneralizationSet"],
    ["Association", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLAssociation(), b, e, a, d)
    }, 2, "UMLAssociation"],
    ["Component realization", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLRealization(), b, e, a, d)
    }, 2, "UMLRealization"],
    ["Connector", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLConnector(), b, e, a, d)
    }, 2, "UMLConnector"],
    ["Dependency", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLDependency(), b, e, a, d)
    }, 2, "UMLDependency"],
];
_acceptedDiagrams.push("UMLDeploymentDiagram");
_acceptedElementsUML.push(["Artifact", "UMLArtifact"], ["Association n-ary", "UMLNAssociation"], ["Generalization set", "UMLGeneralizationSet"], ["Node", "UMLNode"], ["Node(text notation)", "UMLNodeTextNotation"], ["Deployment specification", "UMLDeploymentSpecification"]);
_genericMenu.push(["New deployment diagram", function(a) {
    a.addDiagram(new UMLDeploymentDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLDeploymentDiagram"]); /* http://www.jrromero.net/tools/jsUML2 */
_specificMenu.UMLDeploymentDiagram = [
    ["Artifact", function(b, a, d) {
        var c = new UMLArtifact({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLArtifact"],
    ["Artifact instance", function(b, a, d) {
        var c = new UMLInstanceArtifact({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInstanceArtifact"],
    ["Deployment specification", function(b, a, d) {
        var c = new UMLDeploymentSpecification({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLDeploymentSpecification"],
    ["Node", function(b, a, d) {
        var c = new UMLNode({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLNode"],
    ["Node(text notation)", function(b, a, d) {
        var c = new UMLNodeTextNotation({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLNodeTextNotation"],
    ["N-ary association", function(b, a, d) {
        var c = new UMLNAssociation({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLNAssociation"],
    ["Generalization", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && b.getType() == "UMLGeneralizationSet") {
            b.addElement(a);
            e.addElement(b.getRelation(a))
        } else {
            if (a && a.getType() == "UMLGeneralizationSet") {
                a.addElement(b);
                e.addElement(a.getRelation(b))
            } else {
                e.addRelationFromPoints(new UMLGeneralization(), d, g, c, f)
            }
        }
    }, 2, "UMLGeneralization"],
    ["Generalization set", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLGeneralizationSet(), b, e, a, d)
    }, 2, "UMLGeneralizationSet"],
    ["Association", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g); /* http://www.jrromero.net/tools/jsUML2 */
        var a = e.getElementByPoint(c, f);
        if (b && b.getType() == "UMLNAssociation") {
            b.addElement(a);
            e.addElement(b.getRelation(a))
        } else {
            if (a && a.getType() == "UMLNAssociation") {
                a.addElement(b); /* http://www.jrromero.net/tools/jsUML2 */
                e.addElement(a.getRelation(b))
            } else {
                e.addRelationFromPoints(new UMLAssociation(), d, g, c, f)
            }
        }
    }, 2, "UMLAssociation"],
    ["Dependency", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLDependency(), b, e, a, d)
    }, 2, "UMLDependency"],
    ["Deployment", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLDeployment(), b, e, a, d)
    }, 2, "UMLDeployment"],
    ["Manifestation", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLManifestation(), b, e, a, d)
    }, 2, "UMLManifestation"]
];
_acceptedDiagrams.push("UMLActivityDiagram");
_acceptedElementsUML.push(["AcceptEventAction", "UMLAcceptEventAction"], ["TimeEvent", "UMLTimeEvent"], ["SendSignalAction", "UMLSendSignalAction"], ["Action", "UMLAction"], ["ObjectNode", "UMLObject"], ["Activity", "UMLActivity"], ["DataStore", "UMLDataStore"], ["Connector", "UMLConnectorActivity"], ["HorizontalSwimlane", "UMLHorizontalSwimlane"], ["VerticalSwimlane", "UMLVerticalSwimlane"], ["Horizontal Hierarchical Swimlane", "UMLHorizontalHierarchicalSwimlane"], ["Vertical Hierarchical Swimlane", "UMLVerticalHierarchicalSwimlane"]);
_genericMenu.push(["New activity diagram", function(a) {
    a.addDiagram(new UMLActivityDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLActivityDiagram"]);
_specificMenu.UMLActivityDiagram = [
    ["AcceptEventAction", function(b, a, d) {
        var c = new UMLAcceptEventAction({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLAcceptEventAction"],
    ["TimeEvent", function(b, a, d) {
        var c = new UMLTimeEvent({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLTimeEvent"],
    ["SendSignalAction", function(b, a, d) {
        var c = new UMLSendSignalAction({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLSendSignalAction"],
    ["Action", function(b, a, d) {
        var c = new UMLAction({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLAction"],
    ["ObjectNode", function(b, a, d) {
        var c = new UMLObject({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLObject"],
    ["Activity", function(b, a, d) {
        var c = new UMLActivity({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLActivity"],
    ["DataStore", function(b, a, d) {
        var c = new UMLDataStore({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLDataStore"],
    ["Connector", function(b, a, d) {
        var c = new UMLConnectorActivity({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLConnector2"],
    ["HorizontalSwimlane", function(b, a, c) {
        b.addElement(new UMLHorizontalSwimlane({
            x: a,
            y: c
        }))
    }, 1, "UMLHorizontalSwimlane"],
    ["VerticalSwimlane", function(b, a, c) {
        b.addElement(new UMLVerticalSwimlane({
            x: a,
            y: c
        }))
    }, 1, "UMLVerticalSwimlane"],
    ["HorizontalHierarchicalSwimlane", function(b, a, d) {
        var c = new UMLHorizontalHierarchicalSwimlane({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLHorizontalHierarchicalSwimlane"],
    ["VerticalHierarchicalSwimlane", function(b, a, d) {
        var c = new UMLVerticalHierarchicalSwimlane({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLVerticalHierarchicalSwimlane"],
    ["Add pin", function(b, a, e) {
        var d = b.getElementByPoint(a, e);
        if (d != null && d.getType() == "UMLAction") {
            var c = new UMLPin({
                stereotypes: _stereotypes
            });
            d.addPort(c)
        }
    }, 1, "UMLPin"],
    ["Parameter node", function(b, a, e) {
        var d = b.getElementByPoint(a, e);
        if (d != null && d.getType() == "UMLActivity") {
            var c = new UMLParameterNode({
                stereotypes: _stereotypes
            });
            d.addPort(c)
        }
    }, 1, "UMLParameterNode"],
    ["Expansion node", function(b, a, e) {
        var d = b.getElementByPoint(a, e);
        if (d != null && d.getType() == "UMLAction") {
            var c = new UMLExpansionNode({
                stereotypes: _stereotypes
            });
            d.addPort(c)
        }
    }, 1, "UMLExpansionNode"],
    ["Flow/Edge", function(c, b, f, a, e) {
        var j = c.getElementByPoint(b, f);
        var h = c.getElementByPoint(a, e);
        var g = 0;
        var d = 0;
        if (j instanceof NodeForkJoin) {
            g = (j._quadrant == 1) ? (b - j._x) : 0;
            d = (j._quadrant == 2) ? (f - j._y) : 0
        } else {
            if (h instanceof NodeForkJoin) {
                g = (h._quadrant == 1) ? (a - h._x) : 0;
                d = (h._quadrant == 2) ? (e - h._y) : 0
            }
        }
        if (j && h && !(j instanceof NodeForkJoin && h instanceof NodeForkJoin)) {
            c.addElement(new UMLFlow({
                a: j,
                b: h,
                y: d,
                x: g
            }))
        }
    }, 2, "UMLFlow"],
    ["ExceptionHandler", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLExceptionHandler(), b, e, a, d)
    }, 2, "UMLExceptionHandler"],
    ["ActivityFinal", function(b, a, c) {
        b.addElement(new UMLActivityFinal({
            x: a,
            y: c
        }))
    }, 1, "UMLActivityFinal"],
    ["InitialNode", function(b, a, c) {
        b.addElement(new UMLInitialNode({
            x: a,
            y: c
        }))
    }, 1, "UMLInitialNode"],
    ["FlowFinal", function(b, a, d) {
        var c = new UMLFlowFinal({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLFlowFinal"],
    ["Decision/Merge Node", function(b, a, d) {
        var c = new UMLDecision_MergeNode({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLDecision_MergeNode"],
    ["Fork/Join Node", function(b, a, c) {
        b.addElement(new UMLFork_JoinNode({
            x: a,
            y: c
        }))
    }, 1, "UMLFork_JoinNode"]
];
_acceptedDiagrams.push("UMLSequenceDiagram");
_acceptedElementsUML.push(["Lifeline", "UMLLifeline"], ["Option", "UMLOption"], ["Alternative", "UMLAlternative"], ["Loop", "UMLLoop"], ["Break", "UMLBreak"]);
_genericMenu.push(["New sequence diagram", function(a) {
    a.addDiagram(new UMLSequenceDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLSequenceDiagram"]);
_specificMenu.UMLSequenceDiagram = [
    ["Lifeline", function(b, a, d) {
        var c = new UMLLifeline({
            x: a,
            y: 70,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLLifeline"],
    ["Create", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && a && b != a && (b.getType() == "UMLLifeline" || b.getType() == "TimeInterval") && a.getType() == "UMLLifeline" && !a.getCreate()) {
            e.addElement(new UMLCreate({
                a: b,
                b: a,
                y: g
            }))
        }
    }, 2, "UMLCreate"],
    ["Destroy", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && a && b != a && (b.getType() == "UMLLifeline" || b.getType() == "TimeInterval") && a.getType() == "UMLLifeline" && !a.getDelete()) {
            e.addElement(new UMLDestroy({
                a: b,
                b: a,
                y: g
            }))
        }
    }, 2, "UMLDestroy"],
    ["Option", function(b, a, d) {
        var c = new UMLOption({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInteraction"],
    ["Alternative", function(b, a, d) {
        var c = new UMLAlternative({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInteraction"],
    ["Loop", function(b, a, d) {
        var c = new UMLLoop({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInteraction"],
    ["Break", function(b, a, d) {
        var c = new UMLBreak({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLInteraction"],
    ["Send message", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && a && (b.getType() == "UMLLifeline" || b.getType() == "TimeInterval") && (a.getType() == "UMLLifeline" || a.getType() == "TimeInterval")) {
            e.addElement(new UMLSendMessage({
                a: b,
                b: a,
                y: g
            }))
        }
    }, 2, "UMLSendMessage"],
    ["Call message", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && a && (b.getType() == "UMLLifeline" || b.getType() == "TimeInterval") && (a.getType() == "UMLLifeline" || a.getType() == "TimeInterval")) {
            e.addElement(new UMLCallMessage({
                a: b,
                b: a,
                y: g
            }))
        }
    }, 2, "UMLCallMessage"],
    ["Reply message", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b != a && b != null && (b.getType() == "UMLLifeline" || b.getType() == "TimeInterval") && (a.getType() == "UMLLifeline" || a.getType() == "TimeInterval")) {
            e.addElement(new UMLReplyMessage({
                a: b,
                b: a,
                y: g
            }))
        }
    }, 2, "UMLReplyMessage"],
    ["Delete message", function(e, d, g, c, f) {
        var b = e.getElementByPoint(d, g);
        var a = e.getElementByPoint(c, f);
        if (b && a && b != a && (b.getType() == "UMLLifeline" || b.getType() == "TimeInterval") && a.getType() == "UMLLifeline" && !a.getDelete()) {
            e.addElement(new UMLDeleteMessage({
                a: b,
                b: a,
                y: g
            }))
        }
    }, 2, "UMLDeleteMessage"],
];
_acceptedDiagrams.push("UMLStateMachineDiagram");
_acceptedElementsUML.push(["SimpleState", "UMLSimpleState"], ["CompositeState", "UMLCompositeState"], ["VerticalRegion", "UMLVerticalRegion"], ["HorizontalRegion", "UMLHorizontalRegion"]);
_genericMenu.push(["New state machine diagram", function(a) {
    a.addDiagram(new UMLStateMachineDiagram({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLStateMachineDiagram"]);
_specificMenu.UMLStateMachineDiagram = [
    ["Initial state", function(b, a, c) {
        b.addElement(new UMLInitialPseudostate({
            x: a,
            y: c
        }))
    }, 1, "UMLInitialPseudostate"],
    ["Final state", function(b, a, c) {
        b.addElement(new UMLFinalState({
            x: a,
            y: c
        }))
    }, 1, "UMLFinalState"],
    ["Terminate", function(b, a, d) {
        var c = new UMLTerminate({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(new UMLTerminate({
            x: a,
            y: d
        }))
    }, 1, "UMLTerminate"],
    ["Entry point", function(b, a, d) {
        var c = new UMLEntryPoint({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLEntryPoint"],
    ["Exit point", function(b, a, d) {
        var c = new UMLExitPoint({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLExitPoint"],
    ["Junction", function(b, a, d) {
        var c = new UMLJunction({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLJunction"],
    ["Simple state", function(b, a, d) {
        var c = new UMLSimpleState({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLSimpleState"],
    ["Composite state", function(b, a, d) {
        var c = new UMLCompositeState({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLCompositeState"],
    ["Vertical region", function(b, a, d) {
        var c = new UMLVerticalRegion({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLVerticalRegion"],
    ["Horizontal region", function(b, a, d) {
        var c = new UMLHorizontalRegion({
            x: a,
            y: d,
            stereotypes: _stereotypes
        });
        b.addElement(c)
    }, 1, "UMLHorizontalRegion"],
    ["Transition", function(c, b, e, a, d) {
        c.addRelationFromPoints(new UMLTransition(), b, e, a, d)
    }, 2, "UMLTransition"]
];
_acceptedDiagrams.push("UMLProfile");
_genericMenu.push(["New profile", function(a) {
    a.addDiagram(new UMLProfile({
        backgroundNodes: ApplicationValues.element_color
    }))
}, 0, "UMLProfile"]);
Application.prototype.setProfileSpecificMenu = function() {
    var a = this;
    _specificMenu.UMLProfile = [
        ["Metaclass", function(d, b, e) {
            var c = new UMLMetaclass({
                x: b,
                y: e,
                diagrams: a._diagrams,
                validMetaclass: _acceptedElementsUML
            });
            _metaclass.push(c);
            d.addElement(c)
        }, 1, "UMLMetaclass"],
        ["Stereotype", function(c, b, e) {
            var d = new UMLStereotype({
                x: b,
                y: e,
                diagrams: a._diagrams
            });
            _stereotypes.push(d);
            c.addElement(d)
        }, 1, "UMLStereotype"],
        ["Extension", function(d, c, f, b, e) {
            d.addRelationFromPoints(new UMLExtension(), c, f, b, e)
        }, 2, "UMLExtension"]
    ]
};