//
//  RemoteController.swift
//  VizioIR
//
//  Created by Anuv Gupta on 9/5/19.
//  Copyright © 2019 Anuv Gupta. All rights reserved.
//

import UIKit
import Foundation

class RemoteController: UIViewController {
    
    @IBOutlet weak var powerButton: UIButton!
    @IBOutlet weak var inputButton: UIButton!
    @IBOutlet weak var netflixButton: UIButton!
    @IBOutlet weak var rewindButton: UIButton!
    @IBOutlet weak var pauseButton: UIButton!
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var forwardButton: UIButton!
    @IBOutlet weak var captionButton: UIButton!
    @IBOutlet weak var recordButton: UIButton!
    @IBOutlet weak var stopButton: UIButton!
    @IBOutlet weak var infoButton: UIButton!
    @IBOutlet weak var exitButton: UIButton!
    @IBOutlet weak var menuButton: UIButton!
    @IBOutlet weak var upButton: UIButton!
    @IBOutlet weak var leftButton: UIButton!
    @IBOutlet weak var rightButton: UIButton!
    @IBOutlet weak var downButton: UIButton!
    @IBOutlet weak var okButton: UIButton!
    @IBOutlet weak var backButton: UIButton!
    @IBOutlet weak var guideButton: UIButton!
    @IBOutlet weak var vizioButton: UIButton!
    @IBOutlet weak var volUpButton: UIButton!
    @IBOutlet weak var volDownButton: UIButton!
    @IBOutlet weak var volMuteButton: UIButton!
    @IBOutlet weak var chUpButton: UIButton!
    @IBOutlet weak var chDownButton: UIButton!
    @IBOutlet weak var returnButton: UIButton!
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
    
    var buttonRadius: CGFloat = 4
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        powerButton.layer.roundCorners(radius: buttonRadius)
        powerButton.imageView?.contentMode = .scaleAspectFit
        inputButton.layer.roundCorners(radius: buttonRadius)
        netflixButton.layer.roundCorners(radius: buttonRadius)
        netflixButton.imageView?.contentMode = .scaleAspectFit
        rewindButton.layer.roundCorners(radius: buttonRadius)
        rewindButton.imageView?.contentMode = .scaleAspectFit
        pauseButton.layer.roundCorners(radius: buttonRadius)
        pauseButton.imageView?.contentMode = .scaleAspectFit
        playButton.layer.roundCorners(radius: buttonRadius)
        playButton.imageView?.contentMode = .scaleAspectFit
        forwardButton.layer.roundCorners(radius: buttonRadius)
        forwardButton.imageView?.contentMode = .scaleAspectFit
        captionButton.layer.roundCorners(radius: buttonRadius)
        captionButton.imageView?.contentMode = .scaleAspectFit
        recordButton.layer.roundCorners(radius: buttonRadius)
        recordButton.imageView?.contentMode = .scaleAspectFit
        stopButton.layer.roundCorners(radius: buttonRadius)
        stopButton.imageView?.contentMode = .scaleAspectFit
        infoButton.layer.roundCorners(radius: buttonRadius)
        infoButton.imageView?.contentMode = .scaleAspectFit
        exitButton.layer.roundCorners(radius: buttonRadius)
        menuButton.layer.roundCorners(radius: buttonRadius)
        upButton.layer.roundCorners(radius: buttonRadius)
        upButton.imageView?.contentMode = .scaleAspectFit
        leftButton.layer.roundCorners(radius: buttonRadius)
        leftButton.imageView?.contentMode = .scaleAspectFit
        rightButton.layer.roundCorners(radius: buttonRadius)
        rightButton.imageView?.contentMode = .scaleAspectFit
        downButton.layer.roundCorners(radius: buttonRadius)
        downButton.imageView?.contentMode = .scaleAspectFit
        okButton.layer.roundCorners(radius: buttonRadius)
        backButton.layer.roundCorners(radius: buttonRadius)
        guideButton.layer.roundCorners(radius: buttonRadius)
        vizioButton.layer.roundCorners(radius: buttonRadius)
        vizioButton.imageView?.contentMode = .scaleAspectFit
        volUpButton.imageView?.contentMode = .scaleAspectFit
        volUpButton.roundCorners(corners: [.topLeft, .topRight], radius: buttonRadius)
        volDownButton.imageView?.contentMode = .scaleAspectFit
        volDownButton.roundCorners(corners: [.bottomLeft, .bottomRight], radius: buttonRadius)
        chUpButton.imageView?.contentMode = .scaleAspectFit
        chUpButton.roundCorners(corners: [.topLeft, .topRight], radius: buttonRadius)
        chDownButton.imageView?.contentMode = .scaleAspectFit
        chDownButton.roundCorners(corners: [.bottomLeft, .bottomRight], radius: buttonRadius)
        volMuteButton.layer.roundCorners(radius: buttonRadius)
        volMuteButton.imageView?.contentMode = .scaleAspectFit
        returnButton.layer.roundCorners(radius: buttonRadius)
        returnButton.imageView?.contentMode = .scaleAspectFit
        
        bridge.remoteVC = self
    }
    
    @IBAction func powerClicked(_ sender: UIButton) {
        print("power")
        ws.sendButton("power")
    }
    
    @IBAction func inputClicked(_ sender: UIButton) {
        print("input")
    }
    
    @IBAction func netflixClicked(_ sender: UIButton) {
        print("netflix")
    }
    
    @IBAction func rewindClicked(_ sender: UIButton) {
        print("rewind")
    }
    
    @IBAction func pauseClicked(_ sender: UIButton) {
        print("pause")
    }
    
    @IBAction func playClicked(_ sender: UIButton) {
        print("play")
    }
    
    @IBAction func forwardClicked(_ sender: UIButton) {
        print("forward")
    }
    
    @IBAction func captionClicked(_ sender: UIButton) {
        print("captions")
    }
    
    @IBAction func recordClicked(_ sender: UIButton) {
        print("record")
    }
    
    @IBAction func stopClicked(_ sender: UIButton) {
        print("stop")
    }
    
    @IBAction func infoClicked(_ sender: UIButton) {
        print("info")
    }
    
    @IBAction func exitClicked(_ sender: UIButton) {
        print("exit")
    }
    
    @IBAction func menuClicked(_ sender: UIButton) {
        print("menu")
    }
    
    @IBAction func upClicked(_ sender: UIButton) {
        print("up")
    }
    
    @IBAction func leftClicked(_ sender: UIButton) {
        print("left")
    }
    
    @IBAction func rightClicked(_ sender: UIButton) {
        print("right")
    }
    
    @IBAction func downClicked(_ sender: UIButton) {
        print("down")
    }
    
    @IBAction func okClicked(_ sender: UIButton) {
        print("ok")
    }
    
    @IBAction func backClicked(_ sender: UIButton) {
        print("back")
    }
    
    @IBAction func guideClicked(_ sender: UIButton) {
        print("guide")
    }
    
    @IBAction func vizioClicked(_ sender: UIButton) {
        print("vizio")
    }
    
    @IBAction func volUpClicked(_ sender: UIButton) {
        print("vol_up")
    }
    
    @IBAction func volDownClicked(_ sender: UIButton) {
        print("vol_down")
    }
    @IBAction func volMuteClicked(_ sender: UIButton) {
        print("vol_mute")
    }
    
    @IBAction func chUpClicked(_ sender: UIButton) {
        print("ch_up")
    }
    
    @IBAction func chDownClicked(_ sender: UIButton) {
        print("ch_down")
    }
    
    @IBAction func returnClicked(_ sender: UIButton) {
        print("return")
    }
    
}
