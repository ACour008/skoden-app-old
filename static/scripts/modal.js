var modal = document.getElementById('modal-box');
  var link = document.getElementById('open-modal');
  var span = document.getElementsByClassName("close")[0];
	link.onclick = function() {
    modal.style.display = "block";
	}
	span.onclick = function() {
    modal.style.display = "none";
	}
	window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
	}
	document.onkeydown = function(e) {
		e = e || window.event
		var isEscKey = false;
		if ("key" in e) {
			isEscKey = (e.key == 'Escape' || e.key == "Esc");
		} else {
			isEscKey = (e.keyCode == 27);
		}
		if (isEscKey) {
			modal.style.display = "none";
		}
	}