$(document).ready(function(){

  $(".skills_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='skills_h3'><span>skills <i class='fa fa-angle-up'></i></span></h3>" : "<h3 class='skills_h3'><span>skills <i class='fa fa-angle-down'></i></span></h3>";
        });
    });
  });

  $(".experience_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='experience_h3'><span>experience <i class='fa fa-angle-up'></i></span></h3>" : "<h3 class='experience_h3'><span>experience <i class='fa fa-angle-down'></i></span></h3>";
        });
    });
  });

  $(".education_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='education_h3'><span>education <i class='fa fa-angle-up'></i></span></h3>" : "<h3 class='education_h3'><span>education <i class='fa fa-angle-down'></i></span></h3>";
        });
    });
  });

  $(".portfolio_header").click(function () {
    $header = $(this);
    $content = $header.next();
    $content.slideToggle(300, function () {
        $header.html(function () {
            return $content.is(":visible") ? "<h3 class='portfolio_h3'><span>work <i class='fa fa-angle-up'></i></span></h3>" : "<h3 class='portfolio_h3'><span>work <i class='fa fa-angle-down'></i> &nbsp;</span></h3>";
        });
    });
  });
});
