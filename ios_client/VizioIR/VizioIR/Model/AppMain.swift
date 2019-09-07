//
//  AppMain.swift
//  VizioIR
//
//  Created by Anuv Gupta on 9/5/19.
//  Copyright © 2019 Anuv Gupta. All rights reserved.
//

import UIKit
import Foundation

// global application
let application = UIApplication.shared
// global bridge to ViewControllers for WebSocket interface
let bridge: Bridge = Bridge()
// WebSocket client interface
let serverURL: String = "ws://vizio.anuv.me:3006"
let serverAuth: String = "vizioir"
let ws: WSWrapper = WSWrapper()

// extensions
extension UIView {
    // add full borders to UIViews
    public func addBorder(borderColor: UIColor, borderWidth: CGFloat, borderCornerRadius: CGFloat){
        self.layer.borderWidth = borderWidth
        self.layer.borderColor = borderColor.cgColor
        self.layer.cornerRadius = borderCornerRadius
    }
    // add rounded corners to UIViews
    public func roundCorners(corners: UIRectCorner, radius: CGFloat) {
        let path = UIBezierPath(roundedRect: self.bounds, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        let mask = CAShapeLayer()
        mask.path = path.cgPath
        self.layer.mask = mask
    }
    // https://stackoverflow.com/questions/37163850/round-top-corners-of-a-uibutton-in-swift
}
extension CALayer {
    // add shadows and rounded corners to layer
    private func addShadowWithRoundedCorners() {
        if let contents = self.contents {
            masksToBounds = false
            sublayers?.filter{ $0.frame.equalTo(self.bounds) }
                .forEach{ $0.roundCorners(radius: self.cornerRadius) }
            self.contents = nil
            if let sublayer = sublayers?.first, sublayer.name == "contentLayer" {
                sublayer.removeFromSuperlayer()
            }
            let contentLayer = CALayer()
            contentLayer.name = "contentLayer"
            contentLayer.contents = contents
            contentLayer.frame = bounds
            contentLayer.cornerRadius = cornerRadius
            contentLayer.masksToBounds = true
            insertSublayer(contentLayer, at: 0)
        }
    }
    func addShadow(radius: CGFloat, opacity: Float, offset: CGSize, color: UIColor) {
        self.shadowOffset = offset
        self.shadowOpacity = opacity
        self.shadowRadius = radius
        self.shadowColor = color.cgColor
        self.masksToBounds = false
        if cornerRadius != 0 {
            addShadowWithRoundedCorners()
        }
    }
    func roundCorners(radius: CGFloat) {
        self.cornerRadius = radius
        if shadowOpacity != 0 {
            addShadowWithRoundedCorners()
        }
    }
    // (https://medium.com/swifty-tim/views-with-rounded-corners-and-shadows-c3adc0085182)
}
