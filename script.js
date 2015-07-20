$(document).ready(function(){

  $(".skills_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='skills_h3'><span>&nbsp; skills <i class='fa fa-angle-up'></i> &nbsp;</span></h3>" : "<h3 class='skills_h3'><span>&nbsp; skills <i class='fa fa-angle-down'></i> &nbsp;</span></h3>";
        });
    });
  });

  $(".experience_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='experience_h3'><span>&nbsp; experience <i class='fa fa-angle-up'></i> &nbsp;</span></h3>" : "<h3 class='experience_h3'><span>&nbsp; experience <i class='fa fa-angle-down'></i> &nbsp;</span></h3>";
        });
    });
  });

  $(".education_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='education_h3'><span>&nbsp; education <i class='fa fa-angle-up'></i> &nbsp;</span></h3>" : "<h3 class='education_h3'><span>&nbsp; education <i class='fa fa-angle-down'></i> &nbsp;</span></h3>";
        });
    });
  });

  $(".portfolio_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='portfolio_h3'><span>&nbsp; work <i class='fa fa-angle-up'></i> &nbsp;</span></h3>" : "<h3 class='portfolio_h3'><span>&nbsp; work <i class='fa fa-angle-down'></i> &nbsp;</span></h3>";
        });
    });
  });
});
