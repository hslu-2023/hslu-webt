<?php

function validate($condition, $message, $code)
{
    if (!$condition) {
        echo json_encode(["message" => $message]);
        http_response_code($code);
        exit();
    }
}

function validate_request($request)
{
    validate($request != null, "Valid JSON syntax required", 400);

    validate(isset($request["title"]), 'Property "title" is required', 400);
    validate(
        strlen($request["title"]) >= 1 && strlen($request["title"]) <= 90,
        'Property "title" must be inside range [1,90]',
        400
    );

    validate(isset($request["reason"]), 'Property "reason" is required', 400);
    validate(
        $request["reason"] === "leisure" || $request["reason"] === "business",
        'Invalid "reason" value',
        400
    );

    validate(isset($request["country"]), 'Property "country" is required', 400);
    validate(
        strlen($request["country"]) >= 1 && strlen($request["country"]) <= 30,
        'Property "country" must be inside range [1,30]',
        400
    );

    validate(isset($request["city"]), 'Property "city" is required', 400);
    validate(
        strlen($request["city"]) >= 1 && strlen($request["city"]) <= 30,
        'Property "city" must be inside range [1,30]',
        400
    );

    validate(
        isset($request["latitude"]),
        'Property "latitude" is required',
        400
    );
    validate(
        is_numeric($request["latitude"]) &&
            $request["latitude"] >= -90 &&
            $request["latitude"] <= 90,
        'Property "latitude" must be a number inside range [-90,90]',
        400
    );

    validate(
        isset($request["longitude"]),
        'Property "longitude" is required',
        400
    );
    validate(
        is_numeric($request["longitude"]) &&
            $request["longitude"] >= -180 &&
            $request["longitude"] <= 180,
        'Property "longitude" must be a number inside range [-180,180]',
        400
    );

    validate(
        isset($request["description"]),
        'Property "description" is required',
        400
    );
    validate(
        strlen($request["description"]) >= 1 &&
            strlen($request["description"]) <= 300,
        'Property "description" must be inside range [1,300]',
        400
    );
}

$method = $_SERVER["REQUEST_METHOD"];
$body = file_get_contents("php://input");
$request = json_decode($body, true);

$conn = mysqli_connect("localhost", "root", "root", "travel_tales");

if ($method == "GET") {
    validate(
        $conn,
        "Establishing database connection failed (internal error): " .
            mysqli_connect_error(),
        500
    );

    // filter for only leisure trips
    $query =
        "select title, reason, country, city, latitude, longitude, description from trips where reason='leisure'";
    $result = mysqli_query($conn, $query);

    $trips = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $trips[] = $row;
    }

    echo json_encode(["trips" => $trips]);

    mysqli_close($conn);
} elseif ($method == "POST") {
    validate_request($request);

    validate(
        $conn,
        "Establishing database connection failed (internal error): " .
            mysqli_connect_error(),
        500
    );

    $title = $request["title"];
    $reason = $request["reason"];
    $country = $request["country"];
    $city = $request["city"];
    $latitude = $request["latitude"];
    $longitude = $request["longitude"];
    $description = $request["description"];

    $query =
        "insert into trips (title, reason, country, city, latitude, longitude, description) values (?, ?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param(
        $stmt,
        "ssssiis",
        $title,
        $reason,
        $country,
        $city,
        $latitude,
        $longitude,
        $description
    );
    $res = mysqli_stmt_execute($stmt);
    validate($res, "Error occured during insertion", 400);

    if (isset($_COOKIE["saved_trips"])) {
        $savedCount = intval($_COOKIE["saved_trips"]) + 1;
    } else {
        $savedCount = 1;
    }

    setcookie("saved_trips", $savedCount);

    $response = [
        "message" => "Trip added successfully! You've saved $savedCount trips already!",
    ];
    echo json_encode($response);

    mysqli_close($conn);
}
?>
