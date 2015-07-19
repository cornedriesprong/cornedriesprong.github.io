$(document).ready(function(){

  $(".skills_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h2 class='skills_h3'><span>&nbsp; skills <i class='fa fa-angle-up'></i> &nbsp;</span></h2>" : "<h2 class='skills_h3'><span>&nbsp; skills <i class='fa fa-angle-down'></i> &nbsp;</span></h2>";
        });
    });
  });

  $(".experience_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h2 class='experience_h3'><span>&nbsp; experience <i class='fa fa-angle-up'></i> &nbsp;</span></h2>" : "<h2 class='experience_h3'><span>&nbsp; experience <i class='fa fa-angle-down'></i> &nbsp;</span></h2>";
        });
    });
  });

  $(".education_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h2 class='education_h3'><span>&nbsp; education <i class='fa fa-angle-up'></i> &nbsp;</span></h2>" : "<h2 class='education_h3'><span>&nbsp; education <i class='fa fa-angle-down'></i> &nbsp;</span></h2>";
        });
    });
  });

  $(".portfolio_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h2 class='portfolio_h3'><span>&nbsp; portfolio <i class='fa fa-angle-up'></i> &nbsp;</span></h2>" : "<h2 class='portfolio_h3'><span>&nbsp; portfolio <i class='fa fa-angle-down'></i> &nbsp;</span></h2>";
        });
    });
  });
});
