<?php

if (preg_match("/Mobile|Android|BlackBerry|iPhone|Windows Phone/", $_SERVER['HTTP_USER_AGENT'])) {
	include 'controller.html';
} else {
	include 'client.html';
}